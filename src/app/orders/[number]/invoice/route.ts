import { NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createInvoicePdf } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export async function GET(request: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const [{ number }, session] = await Promise.all([params, getSession()]); const token = request.nextUrl.searchParams.get("token");
  const order = await prisma.order.findUnique({ where: { number }, include: { items: true } });
  if (!order || (session?.id !== order.userId && token !== order.accessToken)) notFound();
  const pdf = await createInvoicePdf(order);
  return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="GLOWY-${order.number}.pdf"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
