/**
 * Creates or resets the admin user password.
 *
 * Usage:
 *   ADMIN_EMAIL=franca@example.com ADMIN_PASSWORD=yourpassword \
 *     npx tsx prisma/reset-admin-password.ts
 *
 * If ADMIN_EMAIL / ADMIN_PASSWORD are not set, falls back to the defaults below.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email    = process.env.ADMIN_EMAIL    ?? "admin@rammiesvacation.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";

  if (password === "changeme123") {
    console.warn("⚠️  Using default password. Set ADMIN_PASSWORD env var for production.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.adminUser.upsert({
    where:  { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`✅  Admin user ready: ${user.email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
