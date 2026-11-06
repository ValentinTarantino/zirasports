import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.env.SUPER_ADMIN_EMAIL?.toLowerCase().trim();
const password = process.env.SUPER_ADMIN_PASSWORD;
const name = process.env.SUPER_ADMIN_NAME ?? "Zirasport Admin";

if (!email || !password) {
  throw new Error("Faltan SUPER_ADMIN_EMAIL o SUPER_ADMIN_PASSWORD en .env");
}

const passwordHash = await bcrypt.hash(password, 12);
const user = await prisma.user.upsert({
  where: { email },
  update: { name, passwordHash, role: UserRole.SUPER_ADMIN, isActive: true },
  create: { email, name, passwordHash, role: UserRole.SUPER_ADMIN, adminProfile: { create: {} } },
});

console.log(`SUPER_ADMIN configurado: ${user.email}`);
await prisma.$disconnect();
