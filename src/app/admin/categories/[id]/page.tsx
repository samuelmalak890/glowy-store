import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "../CategoryForm";

export default async function EditCategory({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) { await requireStaff(); const { id } = await params; const { error } = await searchParams; const category = await prisma.category.findUnique({ where: { id } }); if (!category) notFound(); return <main className="section narrow"><Link href="/admin/categories">← عودة للأقسام</Link><h1>تعديل القسم</h1>{error && <p className="error">{error}</p>}<CategoryForm category={category}/></main>; }
