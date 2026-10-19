import Link from "next/link";
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { status: ProductStatus.ACTIVE }, include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 8 }),
    prisma.category.findMany({ where: { isVisible: true }, orderBy: { position: "asc" }, take: 12 }),
  ]);
  return <main><section className="hero"><p className="eyebrow">GLOWY / EGYPT</p><h1>Beauty, styled with intention.</h1><p>Thoughtful accessories and self-care essentials, delivered across Egypt.</p><Link className="button" href="/products">Shop the collection</Link></section><section className="section" dir="rtl"><div className="section-heading"><div><p className="eyebrow">تسوّقي حسب القسم</p><h2>الأقسام</h2></div><Link href="/products">كل المنتجات ←</Link></div><div className="category-grid">{categories.map((category) => <Link className="category-card" href={`/products?category=${category.slug}`} key={category.id}><span>{category.nameAr}</span><small>{category.nameEn}</small></Link>)}</div></section><section className="section"><div className="section-heading"><div><p className="eyebrow">JUST IN</p><h2>New and noteworthy</h2></div><Link href="/products">View all →</Link></div><ProductGrid products={products} /></section></main>;
}
type CardProduct = Prisma.ProductGetPayload<{ include: { images: true; category: true } }>;
export function ProductGrid({ products }: { products: CardProduct[] }) { return <div className="grid">{products.map((p) => <article className="card" key={p.id}><Link href={`/products/${p.slug}`}><div className="image">{p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.nameEn} /> : <span>GLOWY</span>}</div><p className="eyebrow">{p.category.nameEn}</p><h3>{p.nameEn}</h3><p className="price">{Number(p.salePrice ?? p.price).toFixed(2)} EGP {p.salePrice && <del>{Number(p.price).toFixed(2)}</del>}</p></Link></article>)}</div>; }
