import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import pg from "pg";
import ts from "typescript";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { assertLocalTestUrl, baselineSchema } from "./local-test-config.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const stateDir = resolve(root, ".local-test");
const envPath = resolve(root, ".env.local");
const statePath = resolve(stateDir, "settings.json");
const action = process.argv[2] ?? "start";
const composeArgs = ["compose", "--project-name", "rammies-local-test", "--env-file", envPath, "-f", resolve(root, "compose.local-test.yml")];

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { cwd: root, env, windowsHide: true, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed. The local database has not been reset.`);
}

function readState() {
  if (!existsSync(statePath)) throw new Error("Run npm run test:local:setup first.");
  const state = JSON.parse(readFileSync(statePath, "utf8"));
  assertLocalTestUrl(state.databaseUrl);
  return state;
}

function localEnv(state) {
  return {
    ...process.env,
    DATABASE_URL: state.databaseUrl, DIRECT_URL: state.databaseUrl,
    NEXTAUTH_SECRET: state.authSecret, NEXTAUTH_URL: "http://localhost:3000",
    ADMIN_EMAIL: state.adminEmail,
    // Local testing must never inherit outbound-service credentials from the machine.
    RESEND_API_KEY: "", RESEND_FROM_EMAIL: "", STRIPE_SECRET_KEY: "", STRIPE_WEBHOOK_SECRET: "",
    CLOUDINARY_API_KEY: "", CLOUDINARY_API_SECRET: "",
  };
}

async function setup() {
  mkdirSync(stateDir, { recursive: true });
  let state;
  if (existsSync(statePath)) state = readState();
  else {
    if (existsSync(envPath)) throw new Error("An .env.local already exists. Refusing to overwrite your configuration.");
    const password = randomBytes(24).toString("hex");
    state = { password, databaseUrl: `postgresql://rammies_test:${password}@127.0.0.1:55432/rammies_test`, authSecret: randomBytes(32).toString("hex"), adminEmail: "admin@rammies.test", adminPassword: randomBytes(15).toString("base64url") };
    writeFileSync(statePath, JSON.stringify(state, null, 2), { flag: "wx" });
  }
  assertLocalTestUrl(state.databaseUrl);
  if (existsSync(envPath) && !readFileSync(envPath, "utf8").includes(`DATABASE_URL=${state.databaseUrl}`)) throw new Error("Existing .env.local does not match this local database. Refusing to overwrite it.");
  writeFileSync(envPath, [
    "# Generated local test configuration. Never use in production.",
    `DATABASE_URL=${state.databaseUrl}`, `DIRECT_URL=${state.databaseUrl}`,
    `LOCAL_TEST_DB_PASSWORD=${state.password}`, `NEXTAUTH_SECRET=${state.authSecret}`,
    "NEXTAUTH_URL=http://localhost:3000", `ADMIN_EMAIL=${state.adminEmail}`,
    "# External email, payments and uploads are intentionally disabled for local testing.",
    "RESEND_API_KEY=", "RESEND_FROM_EMAIL=", "STRIPE_SECRET_KEY=", "STRIPE_WEBHOOK_SECRET=",
    "CLOUDINARY_API_KEY=", "CLOUDINARY_API_SECRET=", "",
  ].join("\n"));
  const env = localEnv(state);
  run("docker", [...composeArgs, "up", "-d", "--wait", "--wait-timeout", "60"], env);
  const connection = new pg.Client({ connectionString: state.databaseUrl });
  await connection.connect();
  try {
    const tables = await connection.query(`SELECT to_regclass('public."Property"') AS property, to_regclass('public."StaySettings"') AS settings`);
    if (!tables.rows[0].settings) {
      if (tables.rows[0].property) throw new Error("Local database has a partial schema. Inspect it before retrying; no reset was performed.");
      const baselinePath = resolve(stateDir, "baseline.prisma");
      writeFileSync(baselinePath, baselineSchema(readFileSync(resolve(root, "prisma/schema.prisma"), "utf8")));
      run(process.execPath, ["node_modules/prisma/build/index.js", "db", "push", "--schema", baselinePath], env);
      await connection.query(readFileSync(resolve(root, "prisma/changes/minimum-stay.sql"), "utf8"));
      console.log("Applied minimum-stay SQL to the new local database.");
    }
  } finally { await connection.end(); }
  run(process.execPath, ["node_modules/prisma/build/index.js", "generate"], env);
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: state.databaseUrl }) });
  try {
    if (await client.property.count() === 0 && await client.booking.count() === 0) {
      // Reuse the repo's ten property fixtures. Execute this seed only on a verified empty local DB.
      const seed = readFileSync(resolve(root, "prisma/seed.ts"), "utf8")
        .replace(/const ADMIN_EMAIL = .*;/, `const ADMIN_EMAIL = ${JSON.stringify(state.adminEmail)};`)
        .replace(/const ADMIN_PASSWORD = .*;/, `const ADMIN_PASSWORD = ${JSON.stringify(state.adminPassword)};`);
      const compiled = ts.transpileModule(seed, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText;
      const seedPath = resolve(stateDir, "seed.cjs");
      writeFileSync(seedPath, compiled);
      run(process.execPath, [seedPath], env);
    }
    console.log(`Local database ready: ${await client.property.count()} properties; usual minimum ${(await client.staySettings.findUniqueOrThrow({ where: { id: "default" } })).minimumNights} nights.`);
  } finally { await client.$disconnect(); }
  writeFileSync(resolve(stateDir, "LOGIN.md"), `# Local test login\n\nWebsite: http://localhost:3000\n\nAdmin: http://localhost:3000/admin/login\n\nEmail: ${state.adminEmail}\n\nPassword: ${state.adminPassword}\n\nThese credentials are only for this local test database.\n\nStart website and database: npm run dev:local\n\nStop database without deleting data: npm run test:local:stop\n\nNo Supabase access, Stripe keys, or email credentials are needed for the booking/calendar/admin tests. Outbound emails and uploads are disabled.\n`);
  console.log("Test login saved in .local-test/LOGIN.md. Run npm run dev:local to open the site.");
}

async function main() {
  if (action === "setup") return setup();
  const state = readState();
  const env = localEnv(state);
  if (action === "stop") return run("docker", [...composeArgs, "stop"], env);
  run("docker", [...composeArgs, "up", "-d", "--wait", "--wait-timeout", "60"], env);
  if (action === "start") return;
  if (action !== "dev") throw new Error("Use setup, start, stop or dev.");
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-H", "127.0.0.1", "-p", "3000"], { cwd: root, env, windowsHide: true, stdio: "inherit" });
  child.on("exit", (code) => { process.exitCode = code ?? 0; });
  child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
