import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import "./globals.css";
export const metadata: Metadata = { title: "GLOWY — Egyptian beauty & accessories", description: "GLOWY online store" };
export const dynamic = "force-dynamic";
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { const session = await getSession(); return <html lang="en"><body><header><Link className="logo" href="/">GLOWY</Link><nav><Link href="/products">Shop</Link><Link href="/cart">Cart</Link>{session?.role !== "CUSTOMER" && <Link href="/admin">Admin</Link>}{session ? <form action={logout}><button className="link-button">Sign out</button></form> : <Link href="/login">Sign in</Link>}</nav></header>{children}<footer>© {new Date().getFullYear()} GLOWY · Store information and policies require owner review before launch.</footer></body></html>; }
