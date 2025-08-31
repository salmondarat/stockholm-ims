#!/usr/bin/env tsx
import path from "node:path";
import { config as loadEnv } from "dotenv";
// Prefer .env.local for local runs, then fallback to .env
loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true });
loadEnv({ path: path.join(process.cwd(), ".env") });
import type { PrismaClient } from "@prisma/client";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const adjectives = [
  "Pro",
  "Ultra",
  "Compact",
  "Mini",
  "Max",
  "Slim",
  "Plus",
  "Nano",
  "Smart",
  "HD",
  "4K",
  "Wireless",
  "Bluetooth",
  "USB-C",
  "Gaming",
  "Fast",
  "Quiet",
  "RGB",
  "Portable",
];

const nouns = [
  "Mouse",
  "Keyboard",
  "Headset",
  "Webcam",
  "Charger",
  "Power Bank",
  "SSD",
  "HDD",
  "USB Hub",
  "Cable",
  "Adapter",
  "Monitor",
  "Speaker",
  "Microphone",
  "Router",
  "Switch",
  "CPU Cooler",
  "GPU",
  "RAM Kit",
  "NAS",
  "Dock",
  "Laptop Stand",
  "Tripod",
  "Case",
  "Mouse Pad",
  "Drive Enclosure",
  "SD Card",
  "LED Strip",
  "Barcode Scanner",
  "Label Printer",
];

const capacities = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];
const sizes = ["0.5m", "1m", "2m", "3m"];

const cond = ["New", "Used", "Refurbished"] as const;
const tagPool = [
  "tech",
  "peripheral",
  "storage",
  "networking",
  "audio",
  "video",
  "mobile",
  "gaming",
  "accessory",
  "office",
  "labeling",
];

function randomName() {
  const n = pick(nouns);
  const a = pick(adjectives);
  if (n === "SSD" || n === "HDD" || n === "SD Card") {
    return `${a} ${n} ${pick(capacities)}`;
  }
  if (n === "Cable") {
    return `${a} USB-C ${n} ${pick(sizes)}`;
  }
  return `${a} ${n}`;
}

function randomSku(existing: Set<string>) {
  let sku = "";
  do {
    sku = `TP-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${randInt(
      100,
      999
    )}`;
  } while (existing.has(sku));
  existing.add(sku);
  return sku;
}

function randomLocation() {
  const row = String.fromCharCode(65 + randInt(0, 3)); // A-D
  const bin = randInt(1, 24);
  return `Rack ${row}-${bin}`;
}

function randomTags() {
  const count = randInt(0, 3);
  const picks = new Set<string>();
  while (picks.size < count) picks.add(pick(tagPool));
  return Array.from(picks);
}

async function main() {
  const { db } = (await import("@stockholm/db")) as { db: PrismaClient };
  const howMany = 50;
  console.log(`Seeding ${howMany} tech items (no images)...`);
  const seen = new Set<string>();

  const data = Array.from({ length: howMany }).map(() => {
    const name = randomName();
    const sku = randomSku(seen);
    return {
      name,
      sku,
      quantity: randInt(0, 250),
      location: randomLocation(),
      condition: pick([...cond]),
      lowStockThreshold: randInt(0, 10),
      tags: randomTags(),
      photoUrl: null as string | null,
    };
  });

  const res = await db.item.createMany({ data });
  console.log(`Inserted ${res.count} items.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
