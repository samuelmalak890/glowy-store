"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, endSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const credentials = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().trim().min(2).max(100).optional() });
export async function register(form: FormData) {
  const parsed = credentials.safeParse(Object.fromEntries(form));
  if (!parsed.success || !parsed.data.name) redirect("/register?error=Please%20provide%20a%20valid%20name,%20email,%20and%208-character%20password.");
  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (exists) redirect("/register?error=An%20account%20with%20that%20email%20already%20exists.");
  const user = await prisma.user.create({ data: { name: parsed.data.name, email: parsed.data.email.toLowerCase(), passwordHash: await bcrypt.hash(parsed.data.password, 12), role: Role.CUSTOMER } });
  await createSession({ id: user.id, role: user.role, name: user.name });
  redirect("/");
}
export async function login(form: FormData) {
  const parsed = credentials.pick({ email: true, password: true }).safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect("/login?error=Invalid%20email%20or%20password.");
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) redirect("/login?error=Invalid%20email%20or%20password.");
  await createSession({ id: user.id, role: user.role, name: user.name });
  redirect(user.role === Role.CUSTOMER ? "/" : "/admin");
}
export async function logout() { await endSession(); redirect("/"); }
