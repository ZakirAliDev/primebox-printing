import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  catalogSchemaReady?: Promise<void>;
};

/**
 * Prefer discrete Hostinger-style vars when present (avoids URL-encoding footguns).
 * Falls back to DATABASE_URL.
 */
export function resolveDatabaseUrl(): string | undefined {
  const user = process.env.DB_USER?.trim();
  const database = process.env.DB_NAME?.trim();
  const password = process.env.DB_PASSWORD;
  if (user && database && password !== undefined) {
    const host = process.env.DB_HOST?.trim() || "127.0.0.1";
    const port = process.env.DB_PORT?.trim() || "3306";
    return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
  }

  const direct = process.env.DATABASE_URL?.trim();
  return direct || undefined;
}

export function isDatabaseConfigured() {
  return Boolean(resolveDatabaseUrl());
}

export function getPrisma(): PrismaClient {
  const url = resolveDatabaseUrl();
  if (url) {
    // Prisma reads DATABASE_URL from the environment at query time.
    process.env.DATABASE_URL = url;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

/** Create tables if missing. Does not rely on `prisma` CLI or the npm start script. */
export async function ensureDatabaseSchema(): Promise<void> {
  if (!isDatabaseConfigured()) return;

  if (!globalForPrisma.catalogSchemaReady) {
    globalForPrisma.catalogSchemaReady = (async () => {
      const prisma = getPrisma();
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`catalog_document\` (
          \`id\` INT NOT NULL,
          \`data\` JSON NOT NULL,
          \`updatedAt\` DATETIME(3) NOT NULL,
          PRIMARY KEY (\`id\`)
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`admin_preview\` (
          \`token\` VARCHAR(64) NOT NULL,
          \`data\` JSON NOT NULL,
          \`expiresAt\` DATETIME(3) NOT NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`token\`),
          INDEX \`admin_preview_expiresAt_idx\` (\`expiresAt\`)
        )
      `);
    })().catch((error) => {
      globalForPrisma.catalogSchemaReady = undefined;
      throw error;
    });
  }

  await globalForPrisma.catalogSchemaReady;
}
