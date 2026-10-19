"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOrderStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateOrderStatus(form: FormData) {
  await requireOrderStaff();
  const id = z.string().parse(form.get("id")); const status = z.nativeEnum(OrderStatus).parse(form.get("status"));
  const note = z.string().trim().max(300).parse(form.get("note") || "تم تحديث حالة الطلب من لوحة الإدارة");
  await prisma.$transaction([prisma.order.update({ where: { id }, data: { status } }), prisma.orderStatusHistory.create({ data: { orderId: id, status, note } })]);
  revalidatePath("/admin/orders"); revalidatePath(`/admin/orders/${id}`); redirect(`/admin/orders/${id}?success=${encodeURIComponent("تم تحديث حالة الطلب")}`);
}
