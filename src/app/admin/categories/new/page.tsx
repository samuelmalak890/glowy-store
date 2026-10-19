import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { CategoryForm } from "../CategoryForm";

export default async function NewCategory({ searchParams }: { searchParams: Promise<{ error?: string }> }) { await requireStaff(); const { error } = await searchParams; return <main className="section narrow"><Link href="/admin/categories">← عودة للأقسام</Link><h1>إضافة قسم جديد</h1>{error && <p className="error">{error}</p>}<CategoryForm/></main>; }
