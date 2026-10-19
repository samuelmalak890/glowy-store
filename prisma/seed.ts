import bcrypt from "bcryptjs";
import { PrismaClient, ProductStatus, Role } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const ownerPassword = process.env.SEED_OWNER_PASSWORD;
  const ownerEmail = process.env.SEED_OWNER_EMAIL;
  if (!ownerPassword || ownerPassword.length < 12 || !ownerEmail) throw new Error("Set SEED_OWNER_EMAIL and a 12+ character SEED_OWNER_PASSWORD before seeding an owner.");
  const category = await prisma.category.upsert({ where: { slug: "accessories" }, update: {}, create: { slug: "accessories", nameAr: "إكسسوارات", nameEn: "Accessories", position: 1 } });
  await prisma.user.upsert({ where: { email: ownerEmail.toLowerCase() }, update: {}, create: { email: ownerEmail.toLowerCase(), name: "Store Owner", passwordHash: await bcrypt.hash(ownerPassword, 12), role: Role.OWNER } });
  await prisma.product.upsert({ where: { sku: "SAMPLE-GLOW-001" }, update: {}, create: { sku: "SAMPLE-GLOW-001", slug: "sample-gold-hoops", nameAr: "أقراط حلقية ذهبية", nameEn: "Sample Gold Hoops", descriptionAr: "بيانات تجريبية فقط.", descriptionEn: "Sample catalog data only.", price: 350, stock: 12, status: ProductStatus.ACTIVE, featured: true, categoryId: category.id } });
}
main().finally(() => prisma.$disconnect());
