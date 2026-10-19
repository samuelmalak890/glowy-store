import Link from "next/link";
import { ProductStatus } from "@prisma/client";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function Admin() { await requireStaff(); const [products, orders, low] = await Promise.all([prisma.product.count(), prisma.order.count(), prisma.product.count({ where: { stock: { lte: 5 }, status: ProductStatus.ACTIVE } })]); return <main className="section" dir="rtl"><p className="eyebrow">لوحة الإدارة</p><h1>نظرة عامة على المتجر</h1><div className="metrics"><div><small>إجمالي المنتجات</small><strong>{products}</strong></div><div><small>إجمالي الطلبات</small><strong>{orders}</strong></div><div><small>مخزون منخفض</small><strong>{low}</strong></div></div><div className="admin-actions"><Link className="button" href="/admin/products/new">+ إضافة منتج جديد</Link><Link className="secondary-button" href="/admin/products">إدارة المنتجات</Link></div></main>; }
