import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import path from "path";

export type InvoiceOrder = {
  number: string; customerName: string; phone: string; email: string | null; governorate: string; city: string; address: string; notes: string | null;
  subtotal: { toString(): string }; shippingFee: { toString(): string }; total: { toString(): string }; createdAt: Date;
  items: Array<{ productName: string; sku: string; unitPrice: { toString(): string }; quantity: number }>;
};

const money = (value: { toString(): string }) => `${Number(value).toFixed(2)} EGP`;

export async function createInvoicePdf(order: InvoiceOrder): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: `GLOWY Invoice ${order.number}`, Author: "GLOWY Makeup & Accessories" } });
  const stream = new PassThrough(); const chunks: Buffer[] = [];
  stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
  const done = new Promise<Buffer>((resolve, reject) => { stream.on("end", () => resolve(Buffer.concat(chunks))); stream.on("error", reject); });
  doc.pipe(stream);
  const logo = path.join(process.cwd(), "public", "brand", "glowy-logo.png");
  doc.image(logo, 48, 42, { width: 135 });
  doc.fillColor("#934457").fontSize(24).font("Helvetica-Bold").text("INVOICE", 370, 58, { align: "right" });
  doc.fillColor("#80666d").fontSize(10).font("Helvetica").text(`Order: ${order.number}`, 350, 92, { align: "right" });
  doc.text(`Date: ${order.createdAt.toLocaleDateString("en-GB")}`, 350, 108, { align: "right" });
  doc.moveTo(48, 145).lineTo(547, 145).strokeColor("#ead8db").stroke();
  doc.fillColor("#33232a").font("Helvetica-Bold").fontSize(11).text("BILL TO", 48, 165);
  doc.font("Helvetica").fontSize(10).fillColor("#4f3c42").text(order.customerName, 48, 184).text(order.phone, 48, 199).text(order.email || "", 48, 214);
  doc.font("Helvetica-Bold").fillColor("#33232a").text("DELIVERY ADDRESS", 305, 165);
  doc.font("Helvetica").fillColor("#4f3c42").text(`${order.address}, ${order.city}, ${order.governorate}`, 305, 184, { width: 240 });
  const tableTop = 260;
  doc.rect(48, tableTop, 499, 25).fill("#f9e9eb");
  doc.fillColor("#934457").font("Helvetica-Bold").fontSize(9).text("ITEM", 58, tableTop + 8).text("SKU", 280, tableTop + 8).text("QTY", 385, tableTop + 8).text("PRICE", 430, tableTop + 8).text("TOTAL", 490, tableTop + 8);
  let y = tableTop + 38;
  doc.font("Helvetica").fontSize(9).fillColor("#33232a");
  for (const item of order.items) {
    const itemTotal = Number(item.unitPrice) * item.quantity;
    doc.text(item.productName, 58, y, { width: 210, ellipsis: true }).text(item.sku, 280, y, { width: 90, ellipsis: true }).text(String(item.quantity), 385, y).text(money(item.unitPrice), 430, y, { width: 55 }).text(`${itemTotal.toFixed(2)}`, 490, y, { width: 50 });
    y += 24; doc.moveTo(48, y - 6).lineTo(547, y - 6).strokeColor("#f0e2e4").stroke();
  }
  const totalsTop = Math.max(y + 15, 395);
  doc.font("Helvetica").fontSize(10).fillColor("#4f3c42").text("Subtotal", 385, totalsTop).text(money(order.subtotal), 470, totalsTop, { align: "right", width: 77 });
  doc.text("Shipping", 385, totalsTop + 21).text(money(order.shippingFee), 470, totalsTop + 21, { align: "right", width: 77 });
  doc.moveTo(385, totalsTop + 45).lineTo(547, totalsTop + 45).strokeColor("#bd6f83").stroke();
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#934457").text("TOTAL", 385, totalsTop + 54).text(money(order.total), 450, totalsTop + 54, { align: "right", width: 97 });
  if (order.notes) doc.font("Helvetica").fontSize(9).fillColor("#80666d").text(`Customer note: ${order.notes}`, 48, totalsTop + 94, { width: 499 });
  doc.moveTo(48, 740).lineTo(547, 740).strokeColor("#ead8db").stroke();
  doc.font("Helvetica").fontSize(8).fillColor("#80666d").text("GLOWY Makeup & Accessories | 01275966380 | WhatsApp: 01275966380", 48, 752, { align: "center", width: 499 });
  doc.fillColor("#80666d").text("Cairo, El Zeitoun, Teret El Gabal St., opposite Gomla Market", 48, 765, { align: "center", width: 499 });
  doc.fillColor("#80666d").text("Facebook: Glowy Store | Instagram: @glowy_store01", 48, 778, { align: "center", width: 499 });
  doc.end(); return done;
}
