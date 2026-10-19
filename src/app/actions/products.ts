"use server";

import { MovementType, ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  nameAr: z.string().trim().min(2), nameEn: z.string().trim().min(2), descriptionAr: z.string().trim(), descriptionEn: z.string().trim(),
  sku: z.string().trim().min(2).max(80), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  price: z.coerce.number().positive(), salePrice: z.union([z.literal(""), z.coerce.number().positive()]), stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1), status: z.nativeEnum(ProductStatus), featured: z.boolean(), newArrival: z.boolean(), bestSeller: z.boolean(), imageUrl: z.union([z.literal(""), z.string().url()])
}).refine((v) => v.salePrice === "" || v.salePrice < v.price, { message: "Sale price must be lower than the regular price", path: ["salePrice"] });
function formDataToProduct(form: FormData) { return productSchema.safeParse({ ...Object.fromEntries(form), featured: form.get("featured") === "on", newArrival: form.get("newArrival") === "on", bestSeller: form.get("bestSeller") === "on" }); }
function fail(message: string, path = "/admin/products/new"): never { redirect(`${path}?error=${encodeURIComponent(message)}`); }
export async function saveProduct(form: FormData) {
  const staff = await requireStaff(); const parsed = formDataToProduct(form); const id = form.get("id")?.toString();
  if (!parsed.success) fail(parsed.error.issues[0]?.message ?? "Invalid product data", id ? `/admin/products/${id}` : undefined);
  const { imageUrl, ...data } = parsed.data;
  try {
    const existing = id ? await prisma.product.findUnique({ where: { id }, select: { stock: true } }) : null;
    const product = id ? await prisma.product.update({ where: { id }, data: { ...data, salePrice: data.salePrice === "" ? null : data.salePrice, images: imageUrl ? { deleteMany: {}, create: { url: imageUrl, position: 0 } } : undefined } }) : await prisma.product.create({ data: { ...data, salePrice: data.salePrice === "" ? null : data.salePrice, images: imageUrl ? { create: { url: imageUrl, position: 0 } } : undefined } });
    if (!existing || existing.stock !== data.stock) await prisma.inventoryMovement.create({ data: { productId: product.id, actorId: staff.id, previousQuantity: existing?.stock ?? 0, newQuantity: data.stock, type: MovementType.CORRECTION, note: existing ? "Product edit" : "Initial product stock" } });
    revalidatePath("/"); revalidatePath("/products"); revalidatePath(`/products/${product.slug}`); revalidatePath("/admin/products");
  } catch (error) { if (String(error).includes("Unique constraint")) fail("SKU and product slug must each be unique", id ? `/admin/products/${id}` : undefined); throw error; }
  redirect("/admin/products?success=Product%20saved");
}
export async function archiveProduct(form: FormData) { await requireStaff(); const id = z.string().parse(form.get("id")); await prisma.product.update({ where: { id }, data: { status: ProductStatus.ARCHIVED } }); revalidatePath("/"); revalidatePath("/products"); revalidatePath("/admin/products"); }
export async function restoreProduct(form: FormData) { await requireStaff(); const id = z.string().parse(form.get("id")); await prisma.product.update({ where: { id }, data: { status: ProductStatus.DRAFT } }); revalidatePath("/admin/products"); }
export async function adjustStock(form: FormData) {
  const staff = await requireStaff(); const id = z.string().parse(form.get("id")); const change = z.coerce.number().int().parse(form.get("change")); const note = z.string().trim().max(500).parse(form.get("note") || "Manual adjustment");
  await prisma.$transaction(async (tx) => { const p = await tx.product.findUniqueOrThrow({ where: { id } }); const next = p.stock + change; if (next < 0) throw new Error("Stock cannot fall below zero"); await tx.product.update({ where: { id }, data: { stock: next } }); await tx.inventoryMovement.create({ data: { productId: id, actorId: staff.id, previousQuantity: p.stock, newQuantity: next, type: change >= 0 ? MovementType.STOCK_IN : MovementType.STOCK_OUT, note } }); });
  revalidatePath("/admin/products"); revalidatePath("/products");
}
