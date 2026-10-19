import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";
export default async function NewProduct({ searchParams }: { searchParams: Promise<{ error?: string }> }) { await requireStaff(); const [categories, { error }] = await Promise.all([prisma.category.findMany({ where: { isVisible: true }, select: { id: true, nameEn: true }, orderBy: { position: "asc" } }), searchParams]); return <main className="section narrow"><p className="eyebrow">CATALOG MANAGEMENT</p><h1>Add product</h1><ProductForm categories={categories} error={error}/></main>; }
