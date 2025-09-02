#!/usr/bin/env tsx
import path from "node:path";
import { config as loadEnv } from "dotenv";
loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true });
loadEnv({ path: path.join(process.cwd(), ".env") });

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

import type { PrismaClient } from "@prisma/client";

async function upsertCategory(db: PrismaClient, name: string, parentId: string | null = null) {
  const slug = parentId ? `${slugify(name)}-${parentId.slice(0, 6)}` : slugify(name);
  const cat = await db.category.upsert({
    where: { slug },
    update: { name, parentId },
    create: { name, slug, parentId },
  });
  return cat as { id: string };
}

async function main() {
  const { db } = await import("@stockholm/db");
  console.log("Seeding categories...");

  const tech = await upsertCategory(db, "Technology");
  await Promise.all([
    upsertCategory(db, "Laptop", tech.id),
    upsertCategory(db, "Mouse", tech.id),
    upsertCategory(db, "Keyboard", tech.id),
    upsertCategory(db, "Headset", tech.id),
  ]);

  const apparel = await upsertCategory(db, "Apparel");
  await Promise.all([
    upsertCategory(db, "Tshirt", apparel.id),
    upsertCategory(db, "Shirt", apparel.id),
    upsertCategory(db, "Shorts", apparel.id),
    upsertCategory(db, "Jacket", apparel.id),
  ]);

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
