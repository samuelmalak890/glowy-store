import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";
export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) { await requireStaff(); const [{ id }, { error }] = await Promise.all([params, searchParams]); const product = await prisma.product.findUnique({ where: { id }, include: { images: true } }); if (!product) notFound(); const categories = await prisma.category.findMany({ select: { id: true, nameEn: true }, orderBy: { position: "asc" } }); return <main className="section narrow"><p className="eyebrow">CATALOG MANAGEMENT</p><h1>Edit {product.nameEn}</h1><ProductForm product={product} categories={categories} error={error}/></main>; }
