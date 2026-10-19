import Link from "next/link";
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const fallback = { heroEyebrow: "NEW IN / GLOWY", heroTitle: "لمعة ناعمة.\nثقة حقيقية.", heroText: "اكتشفي اختيارات العناية والإكسسوارات التي تجعل كل تفاصيلك أكثر إشراقاً.", heroButtonLabel: "تسوّقي الآن", heroButtonHref: "/products", heroImageUrl: null, promoEyebrow: "عرض مختار", promoTitle: "اختاري ما يناسب أسلوبك", promoText: "أضيفي منتجاتك وأسعارك وصورها من لوحة الإدارة، وستظهر تلقائياً في المتجر.", promoButtonLabel: "تصفحي المنتجات", promoButtonHref: "/products", promoImageUrl: null };

export default async function Home() {
  const [products, categories, storefront] = await Promise.all([
    prisma.product.findMany({ where: { status: ProductStatus.ACTIVE }, include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 8 }),
    prisma.category.findMany({ where: { isVisible: true }, orderBy: { position: "asc" }, take: 12 }),
    prisma.storefrontContent.findUnique({ where: { id: "main" } }),
  ]);
  const content = storefront ?? fallback;
  return <main>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">{content.heroEyebrow}</p><h1>{content.heroTitle.split("\n").map((line, index, lines) => <span key={index}>{line}{index < lines.length - 1 && <br/>}</span>)}</h1><p>{content.heroText}</p><Link className="button" href={content.heroButtonHref}>{content.heroButtonLabel}</Link></div><div className="hero-art">{content.heroImageUrl ? <img className="hero-upload" src={content.heroImageUrl} alt=""/> : <><div className="hero-bottle bottle-one">GLOWY<br/><small>RADIANCE</small></div><div className="hero-bottle bottle-two">GLOWY<br/><small>GENTLE CARE</small></div><div className="hero-flower">✿</div></>}</div></section>
    <section className="benefits" dir="rtl"><div><b>✦ اختيارات بعناية</b><span>منتجات ومكملات من كتالوجك</span></div><div><b>♡ تجربة سهلة</b><span>تسوّق واضح من الهاتف أو الكمبيوتر</span></div><div><b>⌁ الدفع عند الاستلام</b><span>يظهر للعميل عند تأكيد الطلب</span></div><div><b>✉ ملاحظات للطلب</b><span>يمكن للعميل كتابة طلب خاص</span></div></section>
    <section className="section" dir="rtl"><div className="center-heading"><p className="eyebrow">تسوّقي حسب القسم</p><h2>الأقسام</h2></div><div className="category-grid">{categories.map((category) => <Link className="category-card" href={`/products?category=${category.slug}`} key={category.id}><i>{category.imageUrl ? <img src={category.imageUrl} alt={category.nameAr}/> : category.nameAr.slice(0,1)}</i><span>{category.nameAr}</span><small>{category.nameEn}</small></Link>)}</div></section>
    <section className="editorial section"><div><p className="eyebrow">{content.promoEyebrow}</p><h2>{content.promoTitle}</h2><p>{content.promoText}</p><Link className="button light" href={content.promoButtonHref}>{content.promoButtonLabel}</Link></div><div className="editorial-art">{content.promoImageUrl ? <img src={content.promoImageUrl} alt=""/> : "✿"}</div></section>
    <section className="section"><div className="section-heading"><div><p className="eyebrow">JUST IN</p><h2>وصل حديثاً</h2></div><Link href="/products">عرض الكل ←</Link></div><ProductGrid products={products} /></section>
  </main>;
}
type CardProduct = Prisma.ProductGetPayload<{ include: { images: true; category: true } }>;
export function ProductGrid({ products }: { products: CardProduct[] }) { return <div className="grid">{products.map((p) => <article className="card" key={p.id}><Link href={`/products/${p.slug}`}><div className="image">{p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.nameEn} /> : <span>GLOWY</span>}</div><p className="eyebrow">{p.category.nameEn}</p><h3>{p.nameEn}</h3><p className="price">{Number(p.salePrice ?? p.price).toFixed(2)} EGP {p.salePrice && <del>{Number(p.price).toFixed(2)}</del>}</p></Link></article>)}</div>; }
