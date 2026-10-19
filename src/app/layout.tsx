import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import "./globals.css";
import "./categories.css";
export const metadata: Metadata = { title: "GLOWY — Egyptian beauty & accessories", description: "GLOWY online store" };
export const dynamic = "force-dynamic";
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { const session = await getSession(); return <html lang="en"><body><div className="announcement">✨ اختاري لمعتك الخاصة مع GLOWY — منتجات وإكسسوارات مختارة بعناية</div><header><Link className="logo" href="/"><span>✦</span> GLOWY<small>BEAUTY & ACCESSORIES</small></Link><nav><Link href="/">الرئيسية</Link><Link href="/products">تسوّقي</Link><Link href="/products?category=skincare">العناية</Link><Link href="/products?category=accessories">إكسسوارات</Link><Link href="/cart">السلة</Link>{session?.role !== "CUSTOMER" && <Link href="/admin">الإدارة</Link>}{session ? <form action={logout}><button className="link-button">خروج</button></form> : <Link href="/login">دخول</Link>}</nav></header>{children}<footer><div><Link className="logo" href="/"><span>✦</span> GLOWY<small>BEAUTY & ACCESSORIES</small></Link><p>اختيارات أنيقة لكل يوم.</p></div><div><strong>تسوّقي</strong><Link href="/products">كل المنتجات</Link><Link href="/products?category=makeup">مكياج</Link><Link href="/products?category=skincare">عناية بالبشرة</Link></div><div><strong>مساعدة</strong><Link href="/cart">السلة</Link><Link href="/login">حسابي</Link><span>السياسات ومعلومات التواصل يضيفها مالك المتجر قبل الإطلاق.</span></div><small className="copyright">© {new Date().getFullYear()} GLOWY. جميع الحقوق محفوظة.</small></footer></body></html>; }
