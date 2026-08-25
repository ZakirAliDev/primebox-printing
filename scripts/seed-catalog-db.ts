/**
 * Seed / refresh MySQL catalog_document from src/data/catalog.json
 *
 *   npx tsx scripts/seed-catalog-db.ts
 *   npx tsx scripts/seed-catalog-db.ts --force
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const force = process.argv.includes("--force");
const catalogPath = path.join(process.cwd(), "src/data/catalog.json");

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is required");
  }
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.catalogDocument.findUnique({ where: { id: 1 } });
    if (existing && !force) {
      console.log("Skipped: catalog already in DB (pass --force to overwrite).");
      return;
    }
    const data = JSON.parse(readFileSync(catalogPath, "utf8"));
    await prisma.catalogDocument.upsert({
      where: { id: 1 },
      create: { id: 1, data },
      update: { data },
    });
    console.log("Seeded catalog_document from src/data/catalog.json");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
