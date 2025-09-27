import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  __prisma?: PrismaClient;
};

// Hindari multiple instance saat dev HMR
export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}

// Re-export types kalau perlu
export * from "@prisma/client";

// Alias yang digunakan di apps (import { db } from "@stockholm/db")
export const db = prisma;
