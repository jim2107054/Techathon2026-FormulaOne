import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

// Reuse one Prisma client in development so hot reloads do not exhaust database connections.
export const prisma = globalThis.__prisma ?? new PrismaClient();
globalThis.__prisma = prisma;
