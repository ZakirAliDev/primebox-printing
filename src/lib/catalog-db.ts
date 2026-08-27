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

export type CatalogSource = "database";

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

function emptyCatalog(): Catalog {
  return parseCatalog({});
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

function requireDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "MySQL is required. Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME (or DATABASE_URL).",
    );
  }
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

async function writeCatalogRow(catalog: Catalog): Promise<Catalog> {
  const prisma = getPrisma();
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

function isProductionBuild() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export async function loadCatalogDocument(): Promise<Catalog> {
  requireDatabase();

  try {
    await ensureDatabaseSchema();

    const existing = await readCatalogRow();
    if (existing) {
      return existing.catalog;
    }

    // First boot: empty catalog in MySQL (never seed from catalog.json at runtime).
    return writeCatalogRow(emptyCatalog());
  } catch (error) {
    // ISR prerender runs at build time; Hostinger may not expose MySQL then.
    if (isProductionBuild()) {
      console.warn("Catalog unavailable at build time; using empty shell (ISR fills on first request).");
      return emptyCatalog();
    }
    throw error;
  }
}

export async function saveCatalogDocument(catalog: Catalog): Promise<void> {
  requireDatabase();
  await ensureDatabaseSchema();
  const saved = await writeCatalogRow(catalog);

  if (saved.categories.length !== catalog.categories.length) {
    throw new Error(
      `Catalog save verification failed (categories ${saved.categories.length} != ${catalog.categories.length}).`,
    );
  }
}

/** Kept for older callers; memo no longer used. */
export function clearCatalogMemo() {}

export function getCatalogSource(): CatalogSource {
  requireDatabase();
  return "database";
}
