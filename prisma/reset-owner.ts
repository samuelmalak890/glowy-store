import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length < 12) {
  throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters before running this command.");
}

const prisma = new PrismaClient();
try {
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findFirst({ where: { role: { in: [Role.OWNER, Role.ADMIN] } }, orderBy: { createdAt: "asc" } });
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { email, passwordHash, role: Role.OWNER } });
    console.log("Owner account updated successfully.");
  } else {
    await prisma.user.create({ data: { email, passwordHash, name: "Store Owner", role: Role.OWNER } });
    console.log("Owner account created successfully.");
  }
} finally {
  await prisma.$disconnect();
}
