import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
// Reuse one client per warm serverless instance. This avoids opening an extra
// PostgreSQL connection for every route render on Vercel.
globalForPrisma.prisma = prisma;
