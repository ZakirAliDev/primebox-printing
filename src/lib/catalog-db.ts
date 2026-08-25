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

type CatalogMemo = { version: string; catalog: Catalog };

let catalogMemo: CatalogMemo | null = null;

function cloneCatalog(catalog: Catalog): Catalog {
  return structuredClone(catalog);
}

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

export function clearCatalogMemo() {
  catalogMemo = null;
}

async function loadCatalogFromFile(): Promise<{ catalog: Catalog; version: string }> {
  const [raw, stats] = await Promise.all([fs.readFile(catalogPath, "utf8"), fs.stat(catalogPath)]);
  return { catalog: parseCatalog(JSON.parse(raw) as Partial<Catalog>), version: `file:${stats.mtimeMs}` };
}

async function loadCatalogFromDatabase(): Promise<{ catalog: Catalog; version: string }> {
  await ensureDatabaseSchema();
  const prisma = getPrisma();
  const row = await prisma.catalogDocument.findUnique({ where: { id: CATALOG_DOC_ID } });
  if (!row) {
    // First boot: seed from bundled JSON so the site never starts empty.
    const fromFile = await loadCatalogFromFile();
    const created = await prisma.catalogDocument.create({
      data: { id: CATALOG_DOC_ID, data: fromFile.catalog as object },
    });
    return {
      catalog: parseCatalog(created.data as Partial<Catalog>),
      version: `db:${created.updatedAt.getTime()}`,
    };
  }
  return {
    catalog: parseCatalog(row.data as Partial<Catalog>),
    version: `db:${row.updatedAt.getTime()}`,
  };
}

export async function loadCatalogDocument(): Promise<Catalog> {
  const useDb = isDatabaseConfigured();

  if (useDb) {
    try {
      await ensureDatabaseSchema();
      const prisma = getPrisma();
      if (catalogMemo?.version.startsWith("db:")) {
        const meta = await prisma.catalogDocument.findUnique({
          where: { id: CATALOG_DOC_ID },
          select: { updatedAt: true },
        });
        const version = meta ? `db:${meta.updatedAt.getTime()}` : null;
        if (version && catalogMemo.version === version) {
          return cloneCatalog(catalogMemo.catalog);
        }
      }
      const loaded = await loadCatalogFromDatabase();
      catalogMemo = { version: loaded.version, catalog: loaded.catalog };
      return cloneCatalog(loaded.catalog);
    } catch (error) {
      // Never serve stale bundled JSON in production when MySQL is configured.
      // That made admin saves "work" while the storefront kept showing catalog.json.
      if (process.env.NODE_ENV === "production") {
        console.error("[catalog] MySQL read failed in production.", error);
        throw error;
      }
      console.warn("[catalog] MySQL unavailable, using catalog.json fallback.", error);
    }
  }

  if (catalogMemo?.version.startsWith("file:")) {
    const stats = await fs.stat(catalogPath);
    if (catalogMemo.version === `file:${stats.mtimeMs}`) {
      return cloneCatalog(catalogMemo.catalog);
    }
  }
  const loaded = await loadCatalogFromFile();
  catalogMemo = { version: loaded.version, catalog: loaded.catalog };
  return cloneCatalog(loaded.catalog);
}

export async function saveCatalogDocument(catalog: Catalog): Promise<void> {
  if (!isDatabaseConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "DATABASE_URL (or DB_USER / DB_PASSWORD / DB_NAME) is not set. Catalog edits can’t persist without MySQL.",
      );
    }
    await fs.writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
    clearCatalogMemo();
    return;
  }

  await ensureDatabaseSchema();
  const prisma = getPrisma();
  // Plain JSON so Prisma/MySQL always persist a fresh document (no shared object refs).
  const data = JSON.parse(JSON.stringify(catalog)) as object;
  await prisma.catalogDocument.upsert({
    where: { id: CATALOG_DOC_ID },
    create: { id: CATALOG_DOC_ID, data },
    update: { data },
  });
  // Never trust upsert()'s returned JSON for the memo — MySQL can echo a stale
  // document while updatedAt advances, which made the storefront miss new images.
  clearCatalogMemo();
}
