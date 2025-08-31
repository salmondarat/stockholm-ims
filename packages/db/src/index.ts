import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Hindari multiple instance saat dev HMR
export const prisma =
  global.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV === "development") {
  global.__prisma = prisma;
}

// Re-export types kalau perlu
export * from "@prisma/client";

// Alias yang digunakan di apps (import { db } from "@stockholm/db")
export const db = prisma;
