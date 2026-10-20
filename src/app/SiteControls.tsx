"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/locale";

export function SiteControls({ locale }: { locale: Locale }) {
  const [dark, setDark] = useState(false);
  useEffect(() => { const saved = localStorage.getItem("glowy_theme"); const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches); setDark(isDark); document.documentElement.dataset.theme = isDark ? "dark" : "light"; }, []);
  function toggleTheme() { const next = !dark; setDark(next); document.documentElement.dataset.theme = next ? "dark" : "light"; localStorage.setItem("glowy_theme", next ? "dark" : "light"); }
  function toggleLanguage() { const next = locale === "en" ? "ar" : "en"; document.cookie = `glowy_locale=${next}; path=/; max-age=31536000; samesite=lax`; window.location.reload(); }
  return <div className="site-controls"><button type="button" className="control-button" onClick={toggleLanguage} aria-label="Change language">{locale === "en" ? "AR" : "EN"}</button><button type="button" className="control-button" onClick={toggleTheme} aria-label="Toggle dark mode">{dark ? "☀" : "☾"}</button></div>;
}
