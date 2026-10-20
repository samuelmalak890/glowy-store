"use client";

import { useEffect, useState } from "react";

type DeliveryDetails = { name: string; phone: string; email: string; governorate: string; city: string; address: string; notes: string };
const storageKey = "glowy_delivery_details";
const empty: DeliveryDetails = { name: "", phone: "", email: "", governorate: "", city: "", address: "", notes: "" };

export function CheckoutForm({ action, subtotal, shippingFee }: { action: (form: FormData) => void; subtotal: number; shippingFee: number }) {
  const [values, setValues] = useState<DeliveryDetails>(empty);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const saved = localStorage.getItem(storageKey); if (saved) setValues({ ...empty, ...JSON.parse(saved) }); } catch {} setReady(true); }, []);
  function update(field: keyof DeliveryDetails, value: string) { const next = { ...values, [field]: value }; setValues(next); localStorage.setItem(storageKey, JSON.stringify(next)); }
  return <form action={action} className="form" onSubmit={() => localStorage.setItem(storageKey, JSON.stringify(values))}>
    <label>الاسم بالكامل<input name="name" required value={values.name} onChange={e => update("name", e.target.value)} disabled={!ready}/></label>
    <label>رقم الموبايل المصري<input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01234567890" required value={values.phone} onChange={e => update("phone", e.target.value)} disabled={!ready}/><small>يمكن كتابته 01… أو +20 1…</small></label>
    <label>البريد الإلكتروني (اختياري)<input name="email" type="email" dir="ltr" value={values.email} onChange={e => update("email", e.target.value)} disabled={!ready}/></label>
    <div className="two"><label>المحافظة<input name="governorate" required value={values.governorate} onChange={e => update("governorate", e.target.value)} disabled={!ready}/></label><label>المدينة / المنطقة<input name="city" required value={values.city} onChange={e => update("city", e.target.value)} disabled={!ready}/></label></div>
    <label>العنوان بالتفصيل<textarea name="address" minLength={8} required value={values.address} onChange={e => update("address", e.target.value)} disabled={!ready}/><small>اكتب الشارع، رقم العقار، وأقرب علامة مميزة.</small></label>
    <label>ملاحظات على الطلب (اختياري)<textarea name="notes" placeholder="مثلاً: يفضل الاتصال قبل التوصيل، أو أي طلب خاص." value={values.notes} onChange={e => update("notes", e.target.value)} disabled={!ready}/></label>
    <div className="summary"><span>إجمالي المنتجات</span><strong>{subtotal.toFixed(2)} جنيه</strong><span>الشحن</span><strong>{shippingFee === 0 ? "مجاناً" : `${shippingFee.toFixed(2)} جنيه`}</strong><span>الإجمالي</span><strong>{(subtotal + shippingFee).toFixed(2)} جنيه</strong></div>
    <p className="muted">بيانات التوصيل تُحفظ على هذا الجهاز أثناء الكتابة، حتى لا تضيع عند إعادة تحميل الصفحة.</p><button className="button" disabled={!ready}>{ready ? "إنشاء الطلب" : "جاري تجهيز النموذج…"}</button>
  </form>;
}
