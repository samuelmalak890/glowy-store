"use client";

import type { Locale } from "@/lib/locale";

export function SiteControls({ locale }: { locale: Locale }) {
  function toggleLanguage() { const next = locale === "en" ? "ar" : "en"; document.cookie = `glowy_locale=${next}; path=/; max-age=31536000; samesite=lax`; window.location.reload(); }
  return <div className="site-controls"><button type="button" className="control-button language-button" onClick={toggleLanguage} aria-label="Change language">{locale === "en" ? "AR" : "EN"}</button></div>;
}
