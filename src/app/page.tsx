import Link from "next/link";
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";

const fallback = { heroEyebrow: "NEW IN / GLOWY", heroTitle: "لمعة ناعمة.\nثقة حقيقية.", heroText: "اكتشفي اختيارات العناية والإكسسوارات التي تجعل كل تفاصيلك أكثر إشراقاً.", heroButtonLabel: "تسوّقي الآن", heroButtonHref: "/products", heroImageUrl: null, promoEyebrow: "عرض مختار", promoTitle: "اختاري ما يناسب أسلوبك", promoText: "أضيفي منتجاتك وأسعارك وصورها من لوحة الإدارة، وستظهر تلقائياً في المتجر.", promoButtonLabel: "تصفحي المنتجات", promoButtonHref: "/products", promoImageUrl: null };

export default async function Home() {
  const [products, categories, storefront, locale] = await Promise.all([
    prisma.product.findMany({ where: { status: ProductStatus.ACTIVE }, include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 8 }),
    prisma.category.findMany({ where: { isVisible: true }, orderBy: { position: "asc" }, take: 12 }),
    prisma.storefrontContent.findUnique({ where: { id: "main" } }),
    getLocale(),
  ]);
  const ar = locale === "ar";
  const content = storefront ?? fallback;
  return <main>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">{content.heroEyebrow}</p><h1>{ar ? content.heroTitle.split("\n").map((line, index, lines) => <span key={index}>{line}{index < lines.length - 1 && <br/>}</span>) : "Glow beautifully. Feel confident."}</h1><p>{ar ? content.heroText : "Discover makeup and accessories that make every detail feel more radiant."}</p><Link className="button" href={content.heroButtonHref}>{ar ? content.heroButtonLabel : "Shop now"}</Link></div><div className="hero-art">{content.heroImageUrl ? <img className="hero-upload" src={content.heroImageUrl} alt=""/> : <><div className="hero-bottle bottle-one">GLOWY<br/><small>RADIANCE</small></div><div className="hero-bottle bottle-two">GLOWY<br/><small>GENTLE CARE</small></div><div className="hero-flower">✿</div></>}</div></section>
    <section className="benefits"><div><b>✦ {ar ? "اختيارات بعناية" : "Thoughtfully selected"}</b><span>{ar ? "منتجات ومكملات من كتالوجك" : "Curated products from our catalogue"}</span></div><div><b>♡ {ar ? "تجربة سهلة" : "Easy shopping"}</b><span>{ar ? "تسوّق واضح من الهاتف أو الكمبيوتر" : "Simple on mobile and desktop"}</span></div><div><b>⌁ {ar ? "الدفع عند الاستلام" : "Cash on delivery"}</b><span>{ar ? "يظهر للعميل عند تأكيد الطلب" : "Shown when your order is confirmed"}</span></div><div><b>✉ {ar ? "ملاحظات للطلب" : "Order notes"}</b><span>{ar ? "يمكن للعميل كتابة طلب خاص" : "Add a note for the store"}</span></div></section>
    <section className="section"><div className="center-heading"><p className="eyebrow">{ar ? "تسوّقي حسب القسم" : "SHOP BY CATEGORY"}</p><h2>{ar ? "الأقسام" : "Categories"}</h2></div><div className="category-grid">{categories.map((category) => <Link className="category-card" href={`/products?category=${category.slug}`} key={category.id}><i>{category.imageUrl ? <img src={category.imageUrl} alt={ar ? category.nameAr : category.nameEn}/> : (ar ? category.nameAr : category.nameEn).slice(0,1)}</i><span>{ar ? category.nameAr : category.nameEn}</span><small>{ar ? category.nameEn : category.nameAr}</small></Link>)}</div></section>
    <section className="editorial section"><div><p className="eyebrow">{ar ? content.promoEyebrow : "OUR EDIT"}</p><h2>{ar ? content.promoTitle : "Choose your signature style"}</h2><p>{ar ? content.promoText : "Browse a thoughtful selection of pieces made for your everyday glow."}</p><Link className="button light" href={content.promoButtonHref}>{ar ? content.promoButtonLabel : "Browse products"}</Link></div><div className="editorial-art">{content.promoImageUrl ? <img src={content.promoImageUrl} alt=""/> : "✿"}</div></section>
    <section className="section"><div className="section-heading"><div><p className="eyebrow">JUST IN</p><h2>{ar ? "وصل حديثاً" : "New arrivals"}</h2></div><Link href="/products">{ar ? "عرض الكل ←" : "View all →"}</Link></div><ProductGrid products={products} locale={locale} /></section>
  </main>;
}
type CardProduct = Prisma.ProductGetPayload<{ include: { images: true; category: true } }>;
export function ProductGrid({ products, locale = "en" }: { products: CardProduct[]; locale?: "en" | "ar" }) { const ar = locale === "ar"; return <div className="grid">{products.map((p) => <article className="card" key={p.id}><Link href={`/products/${p.slug}`}><div className="image">{p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.nameEn} /> : <span>GLOWY</span>}</div><p className="eyebrow">{ar ? p.category.nameAr : p.category.nameEn}</p><h3>{ar ? p.nameAr : p.nameEn}</h3><p className="price">{Number(p.salePrice ?? p.price).toFixed(2)} EGP {p.salePrice && <del>{Number(p.price).toFixed(2)}</del>}</p></Link></article>)}</div>; }
