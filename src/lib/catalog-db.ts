import { promises as fs } from "node:fs";
import path from "node:path";

import type { Catalog, Category, Package, ProductAttribute, ProductReview, SiteSettings, TabTemplate, Tag } from "@/lib/catalog";
import {
  DEFAULT_TAB_TEMPLATES,
  normalizeCategory,
  normalizeCategoryPageSettings,
  normalizePackage,
  normalizeProductPageSettings,
  normalizeSiteSettings,
  normalizeTabTemplate,
} from "@/lib/catalog";
import { ensureDatabaseSchema, getPrisma, isDatabaseConfigured } from "@/lib/db";

const CATALOG_DOC_ID = 1;
const catalogPath = path.join(process.cwd(), "src/data/catalog.json");

export type CatalogSource = "database" | "file";

export function parseCatalog(data: Partial<Catalog> | null | undefined): Catalog {
  const raw = data ?? {};
  return {
    categories: (raw.categories ?? []).map((item) => normalizeCategory(item as Category)),
    packages: (raw.packages ?? []).map((item) => normalizePackage(item as Package)),
    tabTemplates: (raw.tabTemplates ?? DEFAULT_TAB_TEMPLATES).map(normalizeTabTemplate),
    tags: (raw.tags ?? []) as Tag[],
    attributes: (raw.attributes ?? []) as ProductAttribute[],
    reviews: (raw.reviews ?? []) as ProductReview[],
    productPageSettings: normalizeProductPageSettings(raw.productPageSettings),
    categoryPageSettings: normalizeCategoryPageSettings(raw.categoryPageSettings),
    siteSettings: normalizeSiteSettings(raw.siteSettings as Partial<SiteSettings> | null),
  };
}

function coerceCatalogJson(data: unknown): Partial<Catalog> {
  if (data == null) {
    return {};
  }
  if (typeof data === "string") {
    return JSON.parse(data) as Partial<Catalog>;
  }
  return data as Partial<Catalog>;
}

async function loadCatalogFromFile(): Promise<Catalog> {
  const raw = await fs.readFile(catalogPath, "utf8");
  return parseCatalog(JSON.parse(raw) as Partial<Catalog>);
}

async function readCatalogRow(): Promise<{ catalog: Catalog; updatedAt: Date } | null> {
  const prisma = getPrisma();
  const row = await prisma.catalogDocument.findUnique({ where: { id: CATALOG_DOC_ID } });
  if (!row) {
    return null;
  }
  return {
    catalog: parseCatalog(coerceCatalogJson(row.data)),
    updatedAt: row.updatedAt,
  };
}

/**
 * Persist catalog via Prisma upsert, then read it back so we know MySQL actually stored it.
 */
async function writeCatalogRow(catalog: Catalog): Promise<Catalog> {
  const prisma = getPrisma();
  // Deep clone through JSON so Prisma receives a plain serializable object.
  const data = JSON.parse(JSON.stringify(catalog)) as object;

  await prisma.catalogDocument.upsert({
    where: { id: CATALOG_DOC_ID },
    create: { id: CATALOG_DOC_ID, data },
    update: { data },
  });

  const verify = await readCatalogRow();
  if (!verify) {
    throw new Error("Catalog save failed: MySQL row missing after write.");
  }
  return verify.catalog;
}

export async function loadCatalogDocument(): Promise<Catalog> {
  if (!isDatabaseConfigured()) {
    return loadCatalogFromFile();
  }

  await ensureDatabaseSchema();

  try {
    const existing = await readCatalogRow();
    if (existing) {
      return existing.catalog;
    }

    // First boot only: seed MySQL from the bundled JSON, then always use MySQL.
    const seeded = await loadCatalogFromFile();
    return writeCatalogRow(seeded);
  } catch (error) {
    // CRITICAL: never fall back to catalog.json when MySQL is configured.
    // That caused admin saves to "work" while the storefront kept showing bundled text/images.
    console.error("[catalog] MySQL required but unavailable.", error);
    throw error;
  }
}

export async function saveCatalogDocument(catalog: Catalog): Promise<void> {
  if (!isDatabaseConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "DB_USER / DB_PASSWORD / DB_NAME (or DATABASE_URL) must be set. Catalog edits can’t persist without MySQL.",
      );
    }
    await fs.writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
    return;
  }

  await ensureDatabaseSchema();
  const saved = await writeCatalogRow(catalog);

  // Spot-check: saved category count must match what we intended to write.
  if (saved.categories.length !== catalog.categories.length) {
    throw new Error(
      `Catalog save verification failed (categories ${saved.categories.length} != ${catalog.categories.length}).`,
    );
  }
}

export async function seedCatalogFromJsonFile(force = false) {
  if (!isDatabaseConfigured()) {
    throw new Error("MySQL is required to seed the database.");
  }
  await ensureDatabaseSchema();
  const existing = await readCatalogRow();
  if (existing && !force) {
    return { seeded: false, reason: "already-exists" as const };
  }
  const fromFile = await loadCatalogFromFile();
  await writeCatalogRow(fromFile);
  return { seeded: true, reason: "ok" as const };
}

/** Kept for callers that previously cleared an in-process memo (memo removed). */
export function clearCatalogMemo() {
  // no-op: catalog is always read fresh from MySQL when configured
}

export function getCatalogSource(): CatalogSource {
  return isDatabaseConfigured() ? "database" : "file";
}
