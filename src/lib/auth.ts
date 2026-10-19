import { Role } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const key = new TextEncoder().encode(process.env.AUTH_SECRET || "development-only-secret-change-before-deploy");
const cookieName = "glowy_session";
export type Session = { id: string; role: Role; name: string };

export async function createSession(session: Session) {
  const token = await new SignJWT(session).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(key);
  const store = await cookies();
  store.set(cookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, key)).payload as unknown as Session; } catch { return null; }
}
export async function requireUser() { const s = await getSession(); if (!s) redirect("/login"); return s; }
export async function requireStaff() {
  const s = await requireUser();
  if (s.role === Role.CUSTOMER || s.role === Role.ORDER_MANAGER) redirect("/");
  return s;
}
export async function endSession() { (await cookies()).delete(cookieName); }
