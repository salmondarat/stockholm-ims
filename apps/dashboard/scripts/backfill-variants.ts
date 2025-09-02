#!/usr/bin/env tsx
import path from "node:path";
import { config as loadEnv } from "dotenv";
loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true });
loadEnv({ path: path.join(process.cwd(), ".env") });

import { db } from "@stockholm/db";

type Variant = { attrs?: Record<string, string>; qty?: number; sku?: string };

function deriveAttrsMap(variants: Variant[]) {
  const map = new Map<string, Set<string>>();
  for (const v of variants) {
    const attrs = v?.attrs || {};
    for (const [k, val] of Object.entries(attrs)) {
      const key = String(k);
      const s = map.get(key) ?? new Set<string>();
      if (val) s.add(String(val));
      map.set(key, s);
    }
  }
  const out: Record<string, string[]> = {};
  for (const [k, set] of map.entries()) out[k] = Array.from(set.values());
  return out;
}

async function main() {
  console.log("Backfilling ItemVariant from legacy options._variants...");
  const items = await db.item.findMany({
    select: { id: true, options: true },
  });
  let updated = 0;
  for (const it of items) {
    const opts = it.options as unknown;
    if (!opts || typeof opts !== "object") continue;
    const rawVariants = (opts as { _variants?: unknown })._variants;
    if (!Array.isArray(rawVariants) || rawVariants.length === 0) continue;

    const existing = await db.itemVariant.count({ where: { itemId: it.id } });
    if (existing > 0) continue; // already migrated

    const variants = rawVariants as Variant[];
    // Insert rows
    await db.itemVariant.createMany({
      data: variants.map((v) => ({
        itemId: it.id,
        sku: typeof v.sku === "string" && v.sku ? v.sku : null,
        qty: Number.isFinite(v.qty as number) ? Number(v.qty) : 0,
        attrs: v.attrs || {},
      })),
    });

    // Rebuild options without _variants, but keep/merge attribute arrays
    const base: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(opts as Record<string, unknown>)) {
      if (String(k).startsWith("_")) continue; // drop internal keys
      base[k] = v;
    }
    const derived = deriveAttrsMap(variants);
    for (const [k, list] of Object.entries(derived)) {
      const existingArr = Array.isArray(base[k])
        ? (base[k] as unknown[]).map(String)
        : [];
      const merged = Array.from(new Set([...existingArr, ...list]));
      base[k] = merged;
    }

    await db.item.update({ where: { id: it.id }, data: { options: base } });
    updated++;
  }
  console.log(`Done. Migrated ${updated} item(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

