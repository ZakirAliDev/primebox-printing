import { cache } from "react";
import { revalidatePath, unstable_cache, updateTag } from "next/cache";
import { deleteCategoryUploads } from "@/lib/category-media";
import type { Catalog, Category, CategoryPageSettings, Package, ProductAttribute, ProductFaq, ProductPageSettings, ProductTab, RelatedMode, SiteSettings, TabTemplate, Tag } from "@/lib/catalog";
import { layoutToHtml } from "@/lib/template-layout";
import { DEFAULT_TAB_TEMPLATES, isCategoryParentInvalid, normalizeCategory, normalizeCategoryPageSettings, normalizePackage, normalizeProductPageSettings, normalizeSiteSettings, normalizeTabTemplate, slugify } from "@/lib/catalog";
import { loadCatalogDocument, saveCatalogDocument } from "@/lib/catalog-db";
import { isDatabaseConfigured } from "@/lib/db";
import { deleteProductUploads, saveRemoteProductImage } from "@/lib/product-media";
import { resolveCategorySlugs, type ProductCsvRow } from "@/lib/product-csv";

/** Bust this tag on every admin catalog write. */
export const CATALOG_CACHE_TAG = "catalog";

/** Storefront ISR window (seconds). Must match `export const revalidate = 300` on public routes. */
export const STOREFRONT_REVALIDATE_SECONDS = 300;

const loadCachedCatalog = unstable_cache(
  async () => loadCatalogDocument(),
  ["catalog-document"],
  { revalidate: STOREFRONT_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] },
);

/** Cached catalog for public pages (deduped per request). */
export const readCatalog = cache(async () => loadCachedCatalog());

/** Uncached catalog for admin screens and server actions that must see latest data. */
export const readCatalogLive = cache(async () => loadCatalogDocument());

async function readCatalogForWrite(): Promise<Catalog> {
  return loadCatalogDocument();
}

async function invalidateStorefrontCache() {
  updateTag(CATALOG_CACHE_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/package-category", "layout");
  revalidatePath("/packages", "layout");
}

async function writeCatalog(catalog: Catalog) {
  await saveCatalogDocument(catalog);
  await invalidateStorefrontCache();
}

export function catalogStorageMode(): "database" {
  if (!isDatabaseConfigured()) {
    throw new Error("MySQL is required. Set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME.");
  }
  return "database";
}

export async function upsertCategory(input: {
  originalSlug?: string;
  slug?: string;
  name: string;
  summary: string;
  description: string;
  cardSupportingText: string;
  image: string;
  parentSlug: string;
  /** When set, category↔product links are updated in the same write (avoids a second stale read). */
  productSlugs?: string[];
}) {
  const catalog = await readCatalogForWrite();
  const slug = slugify(input.slug || input.name);
  if (!slug) {
    throw new Error("Category name is required.");
  }
  const parentSlug = input.parentSlug.trim();
  if (isCategoryParentInvalid(catalog.categories, slug, parentSlug)) {
    throw new Error("Choose a valid parent category.");
  }
  const next: Category = normalizeCategory({
    slug,
    name: input.name.trim(),
    summary: input.summary.trim(),
    description: input.description.trim(),
    cardSupportingText: input.cardSupportingText.trim(),
    image: input.image.trim(),
    parentSlug,
  });
  const from = input.originalSlug || slug;
  catalog.categories = catalog.categories.filter((item) => item.slug !== from && item.slug !== slug);
  if (from !== slug) {
    catalog.packages = catalog.packages.map((item) => ({
      ...item,
      categorySlugs: item.categorySlugs.map((value) => (value === from ? slug : value)),
    }));
    catalog.categories = catalog.categories.map((item) => ({
      ...item,
      parentSlug: item.parentSlug === from ? slug : item.parentSlug,
    }));
  }
  catalog.categories.push(next);

  if (input.productSlugs) {
    const selected = new Set(input.productSlugs.filter(Boolean));
    catalog.packages = catalog.packages.map((item) => {
      const inCategory = item.categorySlugs.includes(slug);
      const shouldBe = selected.has(item.slug);
      if (inCategory === shouldBe) {
        return item;
      }
      if (shouldBe) {
        return { ...item, categorySlugs: [...item.categorySlugs, slug] };
      }
      return { ...item, categorySlugs: item.categorySlugs.filter((value) => value !== slug) };
    });
  }

  await writeCatalog(catalog);
  return next;
}

export async function setCategoryProducts(categorySlug: string, productSlugs: string[]) {
  const catalog = await readCatalogForWrite();
  const selected = new Set(productSlugs.filter(Boolean));
  catalog.packages = catalog.packages.map((item) => {
    const inCategory = item.categorySlugs.includes(categorySlug);
    const shouldBe = selected.has(item.slug);
    if (inCategory === shouldBe) {
      return item;
    }
    if (shouldBe) {
      return { ...item, categorySlugs: [...item.categorySlugs, categorySlug] };
    }
    return { ...item, categorySlugs: item.categorySlugs.filter((value) => value !== categorySlug) };
  });
  await writeCatalog(catalog);
}

export async function deleteCategory(slug: string) {
  const catalog = await readCatalogForWrite();
  const removed = catalog.categories.find((item) => item.slug === slug);
  const parentSlug = removed?.parentSlug ?? "";
  catalog.categories = catalog.categories
    .filter((item) => item.slug !== slug)
    .map((item) => ({
      ...item,
      parentSlug: item.parentSlug === slug ? parentSlug : item.parentSlug,
    }));
  catalog.packages = catalog.packages.map((item) => ({
    ...item,
    categorySlugs: item.categorySlugs.filter((value) => value !== slug),
  }));
  await writeCatalog(catalog);
  await deleteCategoryUploads(slug);
}

export async function upsertPackage(input: {
  originalSlug?: string;
  slug?: string;
  name: string;
  summary: string;
  body: string;
  image: string;
  gallery: string[];
  categorySlugs: string[];
  relatedMode: RelatedMode;
  relatedSlugs: string[];
  faqs: ProductFaq[];
  faqsEnabled: boolean;
  faqsOverride: boolean;
  extraContent: string;
  extraContentOverride: boolean;
  tabs: ProductTab[];
  tabsOverride: boolean;
}) {
  const catalog = await readCatalogForWrite();
  const slug = slugify(input.slug || input.name);
  if (!slug) {
    throw new Error("Product name is required.");
  }
  const next: Package = {
    slug,
    name: input.name.trim(),
    summary: input.summary.trim(),
    body: input.body.trim(),
    image: input.image,
    gallery: input.gallery,
    categorySlugs: input.categorySlugs,
    relatedMode: input.relatedMode === "manual" ? "manual" : "category",
    relatedSlugs: input.relatedSlugs,
    faqs: input.faqs,
    faqsEnabled: input.faqsEnabled,
    faqsOverride: input.faqsOverride,
    extraContent: input.extraContent,
    extraContentOverride: input.extraContentOverride,
    tabs: input.tabs,
    tabsOverride: input.tabsOverride,
  };
  const from = input.originalSlug || slug;
  catalog.packages = catalog.packages
    .filter((item) => item.slug !== from && item.slug !== slug)
    .map((item) => ({
      ...item,
      relatedSlugs: item.relatedSlugs.map((value) => (value === from ? slug : value)),
    }));
  catalog.packages.push(next);
  await writeCatalog(catalog);
  return next;
}

export type PackageImportRowResult = {
  line: number;
  slug: string;
  name: string;
  action: "created" | "updated" | "skipped" | "error";
  message: string;
};

export async function importPackages(
  rows: ProductCsvRow[],
  options: { updateExisting: boolean; downloadImages: boolean },
): Promise<PackageImportRowResult[]> {
  const catalog = await readCatalogForWrite();
  const results: PackageImportRowResult[] = [];

  const resolveImages = async (slug: string, urls: string[]) => {
    const next: string[] = [];
    for (const url of urls) {
      if (!url) {
        continue;
      }
      if (url.startsWith("/") && !url.startsWith("//")) {
        next.push(url);
        continue;
      }
      if (!options.downloadImages) {
        next.push(url);
        continue;
      }
      try {
        next.push(await saveRemoteProductImage(slug, url));
      } catch {
        next.push(url);
      }
    }
    return next;
  };

  for (const row of rows) {
    if (row.skip) {
      results.push({ line: row.line, slug: row.slug, name: row.name, action: "skipped", message: row.skip });
      continue;
    }
    const existing = catalog.packages.find((item) => item.slug === row.slug);
    if (existing && !options.updateExisting) {
      results.push({
        line: row.line,
        slug: row.slug,
        name: row.name,
        action: "skipped",
        message: "A product with this slug already exists.",
      });
      continue;
    }
    const categories = resolveCategorySlugs(row.categoryValues, catalog.categories);
    const imageList = await resolveImages(row.slug, [row.image, ...row.gallery].filter(Boolean));
    const image = row.has.image ? (imageList[0] ?? (existing?.image ?? "")) : (existing?.image ?? imageList[0] ?? "");
    const gallery = row.has.gallery
      ? imageList.slice(image && imageList[0] === image ? 1 : 0)
      : (existing?.gallery ?? imageList.slice(1));
    const next: Package = {
      slug: row.slug,
      name: row.name.trim(),
      summary: row.has.summary ? row.summary : (existing?.summary ?? ""),
      body: row.has.body ? row.body : (existing?.body ?? ""),
      image,
      gallery,
      categorySlugs: row.has.categories ? categories.slugs : (existing?.categorySlugs ?? []),
      relatedMode: row.has.relatedMode ? row.relatedMode : (existing?.relatedMode ?? "category"),
      relatedSlugs: row.has.relatedSlugs ? row.relatedSlugs : (existing?.relatedSlugs ?? []),
      faqs: existing?.faqs ?? [],
      faqsEnabled: existing?.faqsEnabled ?? true,
      faqsOverride: existing?.faqsOverride ?? false,
      extraContent: row.has.extraContent ? row.extraContent : (existing?.extraContent ?? ""),
      extraContentOverride: existing?.extraContentOverride ?? false,
      tabs: existing?.tabs ?? [],
      tabsOverride: existing?.tabsOverride ?? false,
    };
    catalog.packages = catalog.packages.filter((item) => item.slug !== row.slug);
    catalog.packages.push(next);
    const unknown = categories.unknown.length
      ? ` Unknown categories: ${categories.unknown.join(", ")}.`
      : "";
    results.push({
      line: row.line,
      slug: row.slug,
      name: row.name,
      action: existing ? "updated" : "created",
      message: unknown.trim(),
    });
  }

  if (results.some((item) => item.action === "created" || item.action === "updated")) {
    await writeCatalog(catalog);
  }
  return results;
}

export async function patchPackage(
  slug: string,
  patch: Partial<Pick<Package, "faqsEnabled" | "faqsOverride" | "tabsOverride" | "extraContentOverride">>,
) {
  const catalog = await readCatalogForWrite();
  const current = catalog.packages.find((item) => item.slug === slug);
  if (!current) {
    throw new Error("Product not found.");
  }
  catalog.packages = catalog.packages.map((item) => (item.slug === slug ? { ...item, ...patch } : item));
  await writeCatalog(catalog);
}

export async function setGlobalTabsEnabled(enabled: boolean) {
  const catalog = await readCatalogForWrite();
  catalog.productPageSettings = {
    ...catalog.productPageSettings,
    globalTabsEnabled: enabled,
  };
  await writeCatalog(catalog);
}

export async function setGlobalFaqsEnabled(enabled: boolean) {
  const catalog = await readCatalogForWrite();
  catalog.productPageSettings = {
    ...catalog.productPageSettings,
    globalFaqsEnabled: enabled,
  };
  await writeCatalog(catalog);
}

export async function setGlobalExtraContentEnabled(enabled: boolean) {
  const catalog = await readCatalogForWrite();
  catalog.productPageSettings = {
    ...catalog.productPageSettings,
    globalExtraContentEnabled: enabled,
  };
  await writeCatalog(catalog);
}

export async function upsertProductPageSettings(input: ProductPageSettings) {
  const catalog = await readCatalogForWrite();
  catalog.productPageSettings = normalizeProductPageSettings(input);
  await writeCatalog(catalog);
  return catalog.productPageSettings;
}

export async function upsertCategoryPageSettings(input: CategoryPageSettings) {
  const catalog = await readCatalogForWrite();
  catalog.categoryPageSettings = normalizeCategoryPageSettings(input);
  await writeCatalog(catalog);
  return catalog.categoryPageSettings;
}

export async function patchSiteSettings(patch: Partial<SiteSettings>) {
  const catalog = await readCatalogForWrite();
  catalog.siteSettings = normalizeSiteSettings({ ...catalog.siteSettings, ...patch });
  await writeCatalog(catalog);
  return catalog.siteSettings;
}

export async function deletePackage(slug: string) {
  const catalog = await readCatalogForWrite();
  catalog.packages = catalog.packages
    .filter((item) => item.slug !== slug)
    .map((item) => ({
      ...item,
      relatedSlugs: item.relatedSlugs.filter((value) => value !== slug),
    }));
  await writeCatalog(catalog);
  await deleteProductUploads(slug);
}

export async function deletePackages(slugs: string[]) {
  const remove = new Set(slugs.filter(Boolean));
  if (remove.size === 0) {
    return;
  }
  const catalog = await readCatalogForWrite();
  catalog.packages = catalog.packages
    .filter((item) => !remove.has(item.slug))
    .map((item) => ({
      ...item,
      relatedSlugs: item.relatedSlugs.filter((value) => !remove.has(value)),
    }));
  await writeCatalog(catalog);
  await Promise.all([...remove].map((slug) => deleteProductUploads(slug)));
}

export async function deleteCategories(slugs: string[]) {
  const remove = new Set(slugs.filter(Boolean));
  if (remove.size === 0) {
    return;
  }
  const catalog = await readCatalogForWrite();
  let categories = catalog.categories;
  for (const slug of remove) {
    const removed = categories.find((item) => item.slug === slug);
    const parentSlug = removed?.parentSlug ?? "";
    categories = categories
      .filter((item) => item.slug !== slug)
      .map((item) => ({
        ...item,
        parentSlug: item.parentSlug === slug ? parentSlug : item.parentSlug,
      }));
  }
  catalog.categories = categories;
  catalog.packages = catalog.packages.map((item) => ({
    ...item,
    categorySlugs: item.categorySlugs.filter((value) => !remove.has(value)),
  }));
  await writeCatalog(catalog);
  await Promise.all([...remove].map((slug) => deleteCategoryUploads(slug)));
}

function replaceBySlug<T extends { slug: string }>(items: T[], from: string, next: T) {
  return [...items.filter((item) => item.slug !== from && item.slug !== next.slug), next];
}

export async function upsertTag(input: {
  originalSlug?: string;
  slug?: string;
  name: string;
  summary: string;
}) {
  const catalog = await readCatalogForWrite();
  const slug = slugify(input.slug || input.name);
  if (!slug) {
    throw new Error("Tag name is required.");
  }
  const next: Tag = { slug, name: input.name.trim(), summary: input.summary.trim() };
  const from = input.originalSlug || slug;
  catalog.tags = replaceBySlug(catalog.tags, from, next);
  await writeCatalog(catalog);
  return next;
}

export async function deleteTag(slug: string) {
  const catalog = await readCatalogForWrite();
  catalog.tags = catalog.tags.filter((item) => item.slug !== slug);
  await writeCatalog(catalog);
}

export async function deleteTags(slugs: string[]) {
  const remove = new Set(slugs.filter(Boolean));
  if (remove.size === 0) {
    return;
  }
  const catalog = await readCatalogForWrite();
  catalog.tags = catalog.tags.filter((item) => !remove.has(item.slug));
  await writeCatalog(catalog);
}

function retargetTemplateTabs(packages: Package[], from: string, to: string) {
  return packages.map((item) => ({
    ...item,
    tabs: item.tabs.map((tab) =>
      tab.source === "template" && tab.template === from ? { ...tab, template: to } : tab,
    ),
  }));
}

function detachTemplateTabs(packages: Package[], templates: TabTemplate[], slugs: Set<string>) {
  const contents = new Map(
    templates.filter((item) => slugs.has(item.slug)).map((item) => [item.slug, layoutToHtml(item.layout)]),
  );
  return packages.map((item) => ({
    ...item,
    tabs: item.tabs.map((tab) => {
      if (tab.source !== "template" || !tab.template || !slugs.has(tab.template)) {
        return tab;
      }
      return {
        ...tab,
        source: "custom" as const,
        template: undefined,
        content: tab.content || contents.get(tab.template) || "",
      };
    }),
  }));
}

export async function upsertTabTemplate(input: {
  originalSlug?: string;
  slug?: string;
  name: string;
  layout: TabTemplate["layout"];
}) {
  const catalog = await readCatalogForWrite();
  const slug = slugify(input.slug || input.name);
  if (!slug) {
    throw new Error("Template name is required.");
  }
  const next: TabTemplate = { slug, name: input.name.trim(), layout: input.layout };
  const from = input.originalSlug || slug;
  catalog.tabTemplates = replaceBySlug(catalog.tabTemplates, from, next);
  if (from !== slug) {
    catalog.packages = retargetTemplateTabs(catalog.packages, from, slug);
  }
  await writeCatalog(catalog);
  return next;
}

export async function deleteTabTemplate(slug: string) {
  await deleteTabTemplates([slug]);
}

export async function deleteTabTemplates(slugs: string[]) {
  const remove = new Set(slugs.filter(Boolean));
  if (remove.size === 0) {
    return;
  }
  const catalog = await readCatalogForWrite();
  catalog.packages = detachTemplateTabs(catalog.packages, catalog.tabTemplates, remove);
  catalog.tabTemplates = catalog.tabTemplates.filter((item) => !remove.has(item.slug));
  await writeCatalog(catalog);
}

export async function upsertAttribute(input: {
  originalSlug?: string;
  slug?: string;
  name: string;
  terms: string[];
}) {
  const catalog = await readCatalogForWrite();
  const slug = slugify(input.slug || input.name);
  if (!slug) {
    throw new Error("Attribute name is required.");
  }
  const next: ProductAttribute = {
    slug,
    name: input.name.trim(),
    terms: input.terms.map((term) => term.trim()).filter(Boolean),
  };
  const from = input.originalSlug || slug;
  catalog.attributes = replaceBySlug(catalog.attributes, from, next);
  await writeCatalog(catalog);
  return next;
}

export async function deleteAttribute(slug: string) {
  const catalog = await readCatalogForWrite();
  catalog.attributes = catalog.attributes.filter((item) => item.slug !== slug);
  await writeCatalog(catalog);
}

export async function deleteAttributes(slugs: string[]) {
  const remove = new Set(slugs.filter(Boolean));
  if (remove.size === 0) {
    return;
  }
  const catalog = await readCatalogForWrite();
  catalog.attributes = catalog.attributes.filter((item) => !remove.has(item.slug));
  await writeCatalog(catalog);
}

export async function deleteReview(id: string) {
  const catalog = await readCatalogForWrite();
  catalog.reviews = catalog.reviews.filter((item) => item.id !== id);
  await writeCatalog(catalog);
}

export async function deleteReviews(ids: string[]) {
  const remove = new Set(ids.filter(Boolean));
  if (remove.size === 0) {
    return;
  }
  const catalog = await readCatalogForWrite();
  catalog.reviews = catalog.reviews.filter((item) => !remove.has(item.id));
  await writeCatalog(catalog);
}
