"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const urlOrEmpty = z.union([z.literal(""), z.string().url()]);
const categorySchema = z.object({ nameAr: z.string().trim().min(2).max(80), nameEn: z.string().trim().min(2).max(80), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), imageUrl: urlOrEmpty, position: z.coerce.number().int().min(0).max(9999), isVisible: z.boolean() });
const storefrontSchema = z.object({ heroEyebrow: z.string().trim().min(1).max(80), heroTitle: z.string().trim().min(2).max(160), heroText: z.string().trim().min(2).max(400), heroButtonLabel: z.string().trim().min(1).max(50), heroButtonHref: z.string().trim().startsWith("/"), heroImageUrl: urlOrEmpty, promoEyebrow: z.string().trim().min(1).max(80), promoTitle: z.string().trim().min(2).max(160), promoText: z.string().trim().min(2).max(400), promoButtonLabel: z.string().trim().min(1).max(50), promoButtonHref: z.string().trim().startsWith("/"), promoImageUrl: urlOrEmpty });

function categoryData(form: FormData) { return categorySchema.safeParse({ ...Object.fromEntries(form), isVisible: form.get("isVisible") === "on" }); }
function invalidate() { revalidatePath("/"); revalidatePath("/products"); revalidatePath("/admin/categories"); }

export async function saveCategory(form: FormData) {
  await requireStaff();
  const parsed = categoryData(form); const id = form.get("id")?.toString();
  if (!parsed.success) redirect(`${id ? `/admin/categories/${id}` : "/admin/categories/new"}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "بيانات القسم غير صحيحة")}`);
  const data = { ...parsed.data, imageUrl: parsed.data.imageUrl || null };
  try { if (id) await prisma.category.update({ where: { id }, data }); else await prisma.category.create({ data }); }
  catch (error) { if (String(error).includes("Unique constraint")) redirect(`${id ? `/admin/categories/${id}` : "/admin/categories/new"}?error=${encodeURIComponent("الرابط المختصر مستخدم بالفعل")}`); throw error; }
  invalidate(); redirect(`/admin/categories?success=${encodeURIComponent("تم حفظ القسم")}`);
}

export async function hideCategory(form: FormData) { await requireStaff(); const id = z.string().parse(form.get("id")); await prisma.category.update({ where: { id }, data: { isVisible: false } }); invalidate(); }
export async function showCategory(form: FormData) { await requireStaff(); const id = z.string().parse(form.get("id")); await prisma.category.update({ where: { id }, data: { isVisible: true } }); invalidate(); }

export async function saveStorefront(form: FormData) {
  await requireStaff(); const parsed = storefrontSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect(`/admin/storefront?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "راجعي البيانات")}`);
  const data = { ...parsed.data, heroImageUrl: parsed.data.heroImageUrl || null, promoImageUrl: parsed.data.promoImageUrl || null };
  await prisma.storefrontContent.upsert({ where: { id: "main" }, create: { id: "main", ...data }, update: data });
  revalidatePath("/"); redirect(`/admin/storefront?success=${encodeURIComponent("تم تحديث واجهة المتجر")}`);
}
