// lib/prisma.ts

import { PrismaClient } from "@prisma/client";

// --- Prisma Client Initialization for Next.js --- 
// See: https://pris.ly/d/help/next-js-best-practices

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = 
  globalThis.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;

// --- Optional: Re-export types ---
// export * from "@prisma/client"; 
// Keeping this commented out unless explicitly needed, 
// as direct imports from "@prisma/client" are also fine.
