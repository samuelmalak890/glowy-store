import bcrypt from "bcryptjs";
import { PrismaClient, ProductStatus, Role } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const ownerPassword = process.env.SEED_OWNER_PASSWORD;
  const ownerEmail = process.env.SEED_OWNER_EMAIL;
  if (!ownerPassword || ownerPassword.length < 12 || !ownerEmail) throw new Error("Set SEED_OWNER_EMAIL and a 12+ character SEED_OWNER_PASSWORD before seeding an owner.");
  const categoryData = [
    ["bags", "شنط", "Bags"], ["makeup", "مكياج", "Makeup"], ["necklaces", "سلاسل", "Necklaces"],
    ["rings", "خواتم", "Rings"], ["bracelets", "أساور", "Bracelets"], ["earrings", "أقراط", "Earrings"],
    ["watches", "ساعات", "Watches"], ["hair-accessories", "إكسسوارات شعر", "Hair Accessories"],
    ["belts", "أحزمة", "Belts"], ["skincare", "عناية بالبشرة", "Skincare"], ["body-care", "عناية بالجسم", "Body Care"],
    ["sets-bundles", "هدايا ومجموعات", "Sets & Bundles"], ["accessories", "إكسسوارات", "Accessories"],
  ] as const;
  await Promise.all(categoryData.map(([slug, nameAr, nameEn], index) => prisma.category.upsert({ where: { slug }, update: { nameAr, nameEn, position: index + 1 }, create: { slug, nameAr, nameEn, position: index + 1 } })));
  const category = await prisma.category.findUniqueOrThrow({ where: { slug: "accessories" } });
  await prisma.user.upsert({ where: { email: ownerEmail.toLowerCase() }, update: {}, create: { email: ownerEmail.toLowerCase(), name: "Store Owner", passwordHash: await bcrypt.hash(ownerPassword, 12), role: Role.OWNER } });
  await prisma.product.upsert({ where: { sku: "SAMPLE-GLOW-001" }, update: {}, create: { sku: "SAMPLE-GLOW-001", slug: "sample-gold-hoops", nameAr: "أقراط حلقية ذهبية", nameEn: "Sample Gold Hoops", descriptionAr: "بيانات تجريبية فقط.", descriptionEn: "Sample catalog data only.", price: 350, stock: 12, status: ProductStatus.ACTIVE, featured: true, categoryId: category.id } });
}
main().finally(() => prisma.$disconnect());
