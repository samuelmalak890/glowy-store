"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/actions/auth";
import type { Locale } from "@/lib/locale";
import { SiteControls } from "./SiteControls";

export function HeaderNav({ locale, signedIn, staff }: { locale: Locale; signedIn: boolean; staff: boolean }) {
  const [open, setOpen] = useState(false); const path = usePathname(); const ar = locale === "ar";
  const links = [{ href: "/", label: ar ? "الرئيسية" : "Home" }, { href: "/products", label: ar ? "تسوّقي" : "Shop" }, { href: "/products?category=skincare", label: ar ? "العناية" : "Skincare" }, { href: "/products?category=accessories", label: ar ? "إكسسوارات" : "Accessories" }, { href: "/cart", label: ar ? "السلة" : "Cart" }];
  return <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Main navigation"><button className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-nav-links" onClick={() => setOpen(!open)}><span/><span/><span/><b>{ar ? "القائمة" : "Menu"}</b></button><div id="main-nav-links" className="nav-links">{links.map(link => <Link onClick={() => setOpen(false)} className={path === link.href.split("?")[0] ? "active" : ""} href={link.href} key={link.href}>{link.label}</Link>)}{staff && <Link onClick={() => setOpen(false)} className="admin-link" href="/admin">{ar ? "الإدارة" : "Admin"}</Link>}<span className="nav-divider" aria-hidden="true"/>{signedIn ? <form action={logout}><button className="link-button signout-button">{ar ? "خروج" : "Sign out"}</button></form> : <Link onClick={() => setOpen(false)} className="signin-button" href="/login">{ar ? "دخول" : "Sign in"}</Link>}<SiteControls locale={locale}/></div></nav>;
}
