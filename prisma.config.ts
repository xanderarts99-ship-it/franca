import { defineConfig } from "prisma/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
    async adapter(env: NodeJS.ProcessEnv) {
      const pool = new Pool({
        connectionString: env.DIRECT_URL ?? env.DATABASE_URL,
      });
      return new PrismaPg(pool);
    },
  },
});
