/**
 * Creates or resets the admin user password.
 *
 * Usage:
 *   ADMIN_EMAIL=franca@example.com ADMIN_PASSWORD=yourpassword \
 *     npx tsx prisma/reset-admin-password.ts
 */
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
