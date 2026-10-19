import Link from "next/link";
import { ProductStatus } from "@prisma/client";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function Admin() { await requireStaff(); const [products, orders, low] = await Promise.all([prisma.product.count(), prisma.order.count(), prisma.product.count({ where: { stock: { lte: 5 }, status: ProductStatus.ACTIVE } })]); return <main className="section"><p className="eyebrow">ADMINISTRATION</p><h1>Store overview</h1><div className="metrics"><div><small>Total products</small><strong>{products}</strong></div><div><small>Total orders</small><strong>{orders}</strong></div><div><small>Low stock</small><strong>{low}</strong></div></div><p><Link className="button" href="/admin/products">Manage products</Link></p></main>; }
