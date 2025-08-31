#!/usr/bin/env tsx
import path from "node:path";
import { config as loadEnv } from "dotenv";
// Prefer .env.local for local runs, then fallback to .env
loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true });
loadEnv({ path: path.join(process.cwd(), ".env") });
import { hash } from "bcryptjs";

type Args = {
  email: string;
  password: string;
  name?: string;
  role?: "ADMIN" | "STAFF" | "MEMBER";
};
function parseArgs(): Args {
  const email =
    process.argv.find((a) => a.startsWith("--email="))?.split("=")[1] ??
    "admin@stockholm.local";
  const password =
    process.argv.find((a) => a.startsWith("--password="))?.split("=")[1] ??
    "admin123";
  const name =
    process.argv.find((a) => a.startsWith("--name="))?.split("=")[1] ?? "Admin";
  const role =
    (process.argv
      .find((a) => a.startsWith("--role="))
      ?.split("=")[1] as Args["role"]) ?? "ADMIN";
  return { email, password, name, role };
}

async function main() {
  const { db } = await import("@stockholm/db");
  const { email, password, name, role } = parseArgs();
  console.log(`Seeding user: ${email} (${role})`);
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log("User already exists. Skipping.");
    return;
  }
  const passwordHash = await hash(password, 10);
  await db.user.create({ data: { email, name, role, passwordHash } });
  console.log("User created.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
