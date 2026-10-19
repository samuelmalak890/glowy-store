"use server";

import { ProductStatus } from "@prisma/client";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function addToCart(form: FormData) {
  const s = await getSession(); if (!s) redirect("/login?next=/products");
  const productId = z.string().parse(form.get("productId")); const quantity = z.coerce.number().int().min(1).max(50).parse(form.get("quantity") ?? 1);
  const product = await prisma.product.findFirst({ where: { id: productId, status: ProductStatus.ACTIVE } }); if (!product || product.stock < quantity) redirect("/products?error=Product%20is%20unavailable");
  const cart = await prisma.cart.upsert({ where: { userId: s.id }, update: {}, create: { userId: s.id } });
  const item = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } }); const next = (item?.quantity ?? 0) + quantity;
  if (next > product.stock) redirect("/products?error=Requested%20quantity%20exceeds%20stock");
  if (item) await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: next } }); else await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
  revalidatePath("/cart"); redirect("/cart");
}
export async function updateCart(form: FormData) { const s = await getSession(); if (!s) redirect("/login"); const id = z.string().parse(form.get("id")); const quantity = z.coerce.number().int().min(0).parse(form.get("quantity")); const item = await prisma.cartItem.findFirstOrThrow({ where: { id, cart: { userId: s.id } }, include: { product: true } }); if (quantity === 0) await prisma.cartItem.delete({ where: { id } }); else { if (quantity > item.product.stock) redirect("/cart?error=Quantity%20exceeds%20available%20stock"); await prisma.cartItem.update({ where: { id }, data: { quantity } }); } revalidatePath("/cart"); }
const checkoutSchema = z.object({ name: z.string().trim().min(2), phone: z.string().trim().regex(/^(?:\+20|0020|0)?1[0-25][0-9]{8}$/), email: z.union([z.literal(""), z.string().email()]), governorate: z.string().trim().min(2), city: z.string().trim().min(2), address: z.string().trim().min(8), notes: z.string().max(500) });
export async function checkout(form: FormData) {
  const s = await getSession(); if (!s) redirect("/login?next=/checkout"); const parsed = checkoutSchema.safeParse(Object.fromEntries(form)); if (!parsed.success) redirect("/checkout?error=Please%20check%20the%20delivery%20details.");
  const [cart, settings] = await Promise.all([prisma.cart.findUnique({ where: { userId: s.id }, include: { items: { include: { product: true } } } }), prisma.storeSettings.findUnique({ where: { id: "main" } })]); if (!cart?.items.length) redirect("/cart");
  const order = await prisma.$transaction(async (tx) => {
    let subtotal = 0; for (const item of cart.items) { const product = await tx.product.findFirst({ where: { id: item.productId, status: ProductStatus.ACTIVE } }); if (!product || product.stock < item.quantity) throw new Error(`Insufficient stock for ${item.product.nameEn}`); const price = Number(product.salePrice ?? product.price); subtotal += price * item.quantity; await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: item.quantity } } }); await tx.inventoryMovement.create({ data: { productId: product.id, actorId: s.id, previousQuantity: product.stock, newQuantity: product.stock - item.quantity, type: "ORDER_RESERVATION", note: "Order checkout" } }); }
    const shippingFee = settings?.freeShippingThreshold && subtotal >= Number(settings.freeShippingThreshold) ? 0 : Number(settings?.shippingFee ?? 75); const number = `GLW-${Date.now().toString().slice(-8)}`; const o = await tx.order.create({ data: { number, accessToken: randomBytes(24).toString("hex"), userId: s.id, customerName: parsed.data.name, phone: parsed.data.phone, email: parsed.data.email || null, governorate: parsed.data.governorate, city: parsed.data.city, address: parsed.data.address, notes: parsed.data.notes || null, paymentMethod: "Cash on delivery", shippingMethod: "Standard delivery", subtotal, shippingFee, total: subtotal + shippingFee, items: { create: cart.items.map((i) => ({ productId: i.productId, productName: i.product.nameEn, sku: i.product.sku, unitPrice: i.product.salePrice ?? i.product.price, quantity: i.quantity })) }, history: { create: { status: "PENDING_CONFIRMATION", note: "Order created" } } } }); await tx.cartItem.deleteMany({ where: { cartId: cart.id } }); return o;
  });
  revalidatePath("/"); revalidatePath("/products"); redirect(`/orders/${order.number}?token=${order.accessToken}`);
}
