"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { loginAdmin, logoutAdmin, requireAdmin } from "@/lib/admin-auth";
import {
  normalizeCategory,
  normalizeCategoryPaginationStyle,
  normalizeCategorySidebarPosition,
  normalizeExtraContentAlign,
  normalizePackage,
  slugify,
  type Package,
  type ProductTab,
  type SiteSettings,
  type TabSource,
  type TabTemplate,
} from "@/lib/catalog";
import {
  categoryPreviewUrl,
  packagePreviewUrl,
  saveCategoryPreview,
  savePackagePreview,
} from "@/lib/admin-preview";
import { saveCategoryImage } from "@/lib/category-media";
import { faqsFromFormData } from "@/lib/product-faqs";
import { saveProductImage, saveProductImages } from "@/lib/product-media";
import { parseLayoutJson } from "@/lib/template-layout";
import {
  deleteAttribute,
  deleteAttributes,
  deleteCategories,
  deleteCategory,
  deletePackage,
  deletePackages,
  deleteReview,
  deleteReviews,
  deleteTag,
  deleteTags,
  deleteTabTemplate,
  deleteTabTemplates,
  readCatalogLive,
  setGlobalTabsEnabled,
  setGlobalFaqsEnabled,
  setGlobalExtraContentEnabled,
  patchPackage,
  patchSiteSettings,
  upsertAttribute,
  upsertCategory,
  setCategoryProducts,
  upsertCategoryPageSettings,
  upsertPackage,
  importPackages,
  upsertProductPageSettings,
  upsertTag,
  upsertTabTemplate,
} from "@/lib/catalog-store";
import { packagesToCsv, parseProductCsv, resolveCategorySlugs } from "@/lib/product-csv";


export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const ok = await loginAdmin(password);
  if (!ok) {
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function logoutAction() {
  await logoutAdmin();
  redirect("/admin/login");
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const originalSlug = String(formData.get("originalSlug") ?? "");
  try {
    const draft = await buildCategoryDraftFromForm(formData);
    const saved = await upsertCategory({
      originalSlug: originalSlug || undefined,
      slug: draft.slug,
      name: draft.name,
      summary: draft.summary,
      description: draft.description,
      cardSupportingText: draft.cardSupportingText,
      image: draft.image,
      parentSlug: draft.parentSlug,
      productSlugs: draft.productSlugs,
    });
    redirect(`/admin/products/categories/${saved.slug}?${originalSlug ? "updated" : "created"}=1`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    const fallback = originalSlug
      ? `/admin/products/categories/${originalSlug}`
      : "/admin/products/categories/new";
    const message = error instanceof Error ? error.message : "Could not save category.";
    redirect(`${fallback}?error=${encodeURIComponent(message.slice(0, 220))}`);
  }
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  await deleteCategory(String(formData.get("slug") ?? ""));
  redirect("/admin/products/categories?deleted=1");
}

export async function bulkDeleteCategoriesAction(formData: FormData) {
  await requireAdmin();
  if (String(formData.get("bulk") ?? "") !== "trash") {
    redirect("/admin/products/categories");
  }
  const slugs = formData.getAll("slugs").map(String).filter(Boolean);
  if (slugs.length === 0) {
    redirect("/admin/products/categories");
  }
  await deleteCategories(slugs);
  redirect("/admin/products/categories?deleted=1");
}

export async function savePackageAction(formData: FormData) {
  await requireAdmin();
  const draft = await buildPackageDraftFromForm(formData);
  const originalSlug = String(formData.get("originalSlug") ?? "");
  const saved = await upsertPackage({
    originalSlug: originalSlug || undefined,
    ...draft,
  });
  redirect(`/admin/products/${saved.slug}?${originalSlug ? "updated" : "created"}=1`);
}

export async function previewPackageAction(formData: FormData) {
  await requireAdmin();
  try {
    const draft = await buildPackageDraftFromForm(formData);
    if (!draft.slug || !draft.name.trim()) {
      return { error: "Add a product title before previewing." };
    }
    const preview = await savePackagePreview(normalizePackage(draft));
    return { url: packagePreviewUrl(preview.slug, preview.token) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create preview." };
  }
}

export async function previewCategoryAction(formData: FormData) {
  await requireAdmin();
  try {
    const draft = await buildCategoryDraftFromForm(formData);
    if (!draft.slug || !draft.name.trim()) {
      return { error: "Add a category title before previewing." };
    }
    const preview = await saveCategoryPreview(normalizeCategory(draft), draft.productSlugs);
    return { url: categoryPreviewUrl(preview.slug, preview.token) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create preview." };
  }
}

async function buildCategoryDraftFromForm(formData: FormData) {
  const slug = slugify(String(formData.get("slug") ?? "") || String(formData.get("name") ?? ""));
  const imageFile = formData.get("imageFile");
  const uploadedImage =
    imageFile instanceof File && imageFile.size ? await saveCategoryImage(slug, imageFile) : "";
  return {
    slug,
    name: String(formData.get("name") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    description: String(formData.get("description") ?? ""),
    cardSupportingText: String(formData.get("cardSupportingText") ?? ""),
    image: uploadedImage || String(formData.get("image") ?? ""),
    parentSlug: String(formData.get("parentSlug") ?? ""),
    productSlugs: formData.getAll("productSlugs").map(String).filter(Boolean),
  };
}

async function buildPackageDraftFromForm(formData: FormData) {
  const originalSlug = String(formData.get("originalSlug") ?? "");
  const slug = slugify(String(formData.get("slug") ?? "") || String(formData.get("name") ?? ""));
  const imageFile = formData.get("imageFile");
  const galleryFiles = formData
    .getAll("galleryFiles")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const uploadedImage =
    imageFile instanceof File && imageFile.size ? await saveProductImage(slug, imageFile) : "";
  const uploadedGallery = await saveProductImages(slug, galleryFiles);
  const { tabTemplates: library, packages, productPageSettings } = await readCatalogLive();
  const tabsOverride = String(formData.get("tabsOverride") ?? "") === "1";
  const faqsOverride = String(formData.get("faqsOverride") ?? "") === "1";
  const extraContentOverride = String(formData.get("extraContentOverride") ?? "") === "1";
  const existing = packages.find((item) => item.slug === (originalSlug || slug));
  const useGlobalTabs = productPageSettings.globalTabsEnabled && !tabsOverride;
  const useGlobalExtra = productPageSettings.globalExtraContentEnabled && !extraContentOverride;
  const formFaqs = faqsFromFormData(formData);
  const hasFaqsField = formData.has("faqsJson");
  const draft: Package = {
    slug,
    name: String(formData.get("name") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    body: String(formData.get("body") ?? ""),
    image: uploadedImage || String(formData.get("image") ?? ""),
    gallery: [...formData.getAll("gallery").map(String).filter(Boolean), ...uploadedGallery],
    categorySlugs: formData.getAll("categorySlugs").map(String),
    relatedMode: String(formData.get("relatedMode") ?? "") === "manual" ? "manual" : "category",
    relatedSlugs: formData.getAll("relatedSlugs").map(String).filter(Boolean),
    faqs: hasFaqsField ? formFaqs : (existing?.faqs ?? []),
    faqsEnabled: formData.has("faqsEnabled")
      ? String(formData.get("faqsEnabled") ?? "") === "1"
      : (existing?.faqsEnabled ?? true),
    faqsOverride: productPageSettings.globalFaqsEnabled ? faqsOverride : false,
    extraContent: useGlobalExtra ? (existing?.extraContent ?? "") : String(formData.get("extraContent") ?? ""),
    extraContentOverride: productPageSettings.globalExtraContentEnabled ? extraContentOverride : false,
    tabs: useGlobalTabs ? (existing?.tabs ?? []) : tabsFromForm(formData, library),
    tabsOverride: productPageSettings.globalTabsEnabled ? tabsOverride : false,
  };
  return draft;
}

function tabsFromForm(formData: FormData, library: TabTemplate[]): ProductTab[] {
  const tabTitles = formData.getAll("tabTitle").map(String);
  const tabContents = formData.getAll("tabContent").map(String);
  const tabSources = formData.getAll("tabSource").map(String);
  const tabTemplates = formData.getAll("tabTemplate").map(String);
  return tabTitles
    .map((title, index) => {
      const template = (tabTemplates[index] ?? "").trim();
      const source: TabSource = tabSources[index] === "template" && template ? "template" : "custom";
      const templateLabel = library.find((item) => item.slug === template)?.name ?? "";
      return {
        title: title.trim() || (source === "template" ? templateLabel : ""),
        source,
        template: source === "template" ? template : undefined,
        content: (tabContents[index] ?? "").trim(),
      };
    })
    .filter((tab) => tab.title);
}

export async function saveProductPageSettingsAction(formData: FormData) {
  await requireAdmin();
  const { tabTemplates: library, productPageSettings } = await readCatalogLive();
  await upsertProductPageSettings({
    globalTabsEnabled: productPageSettings.globalTabsEnabled,
    globalTabs: tabsFromForm(formData, library),
    globalFaqsEnabled: productPageSettings.globalFaqsEnabled,
    globalFaqs: faqsFromFormData(formData),
    globalExtraContentEnabled: productPageSettings.globalExtraContentEnabled,
    globalExtraContent: String(formData.get("extraContent") ?? ""),
    extraContentAlign: normalizeExtraContentAlign(formData.get("extraContentAlign")),
    extraContentAnimationMs: Number(formData.get("extraContentAnimationMs")),
    extraContentCollapsedHeight: Number(formData.get("extraContentCollapsedHeight")),
    relatedCarouselSlides: {
      base: Number(formData.get("relatedCarouselSlidesBase")),
      sm: Number(formData.get("relatedCarouselSlidesSm")),
      md: Number(formData.get("relatedCarouselSlidesMd")),
      lg: Number(formData.get("relatedCarouselSlidesLg")),
      xl: Number(formData.get("relatedCarouselSlidesXl")),
    },
    relatedCarouselAutoplay: formData.get("relatedCarouselAutoplay") === "on",
    relatedCarouselAutoplayMs: Number(formData.get("relatedCarouselAutoplayMs")),
  });
  redirect("/admin/products/page-settings?updated=1");
}

export async function saveCategoryPageSettingsAction(formData: FormData) {
  await requireAdmin();
  await upsertCategoryPageSettings({
    sidebarEnabled: formData.get("sidebarEnabled") === "on",
    sidebarPosition: normalizeCategorySidebarPosition(formData.get("sidebarPosition")),
    productGridColumns: {
      base: Number(formData.get("productGridColumnsBase")),
      sm: Number(formData.get("productGridColumnsSm")),
      md: Number(formData.get("productGridColumnsMd")),
      lg: Number(formData.get("productGridColumnsLg")),
      xl: Number(formData.get("productGridColumnsXl")),
      "2xl": Number(formData.get("productGridColumns2xl")),
    },
    paginationEnabled: formData.get("paginationEnabled") === "on",
    productsPerPage: Number(formData.get("productsPerPage")),
    paginationStyle: normalizeCategoryPaginationStyle(formData.get("paginationStyle")),
  });
  redirect("/admin/products/categories/page-settings?updated=1");
}

export async function setGlobalTabsEnabledAction(enabled: boolean) {
  await requireAdmin();
  await setGlobalTabsEnabled(enabled);
}

export async function setGlobalFaqsEnabledAction(enabled: boolean) {
  await requireAdmin();
  await setGlobalFaqsEnabled(enabled);
}

export async function setGlobalExtraContentEnabledAction(enabled: boolean) {
  await requireAdmin();
  await setGlobalExtraContentEnabled(enabled);
}

export async function patchSiteSettingsAction(patch: Partial<SiteSettings>) {
  await requireAdmin();
  await patchSiteSettings(patch);
}

export async function setProductTabsOverrideAction(slug: string, enabled: boolean) {
  await requireAdmin();
  await patchPackage(slug, { tabsOverride: enabled });
}

export async function setProductFaqsOverrideAction(slug: string, enabled: boolean) {
  await requireAdmin();
  await patchPackage(slug, { faqsOverride: enabled });
}

export async function setProductExtraContentOverrideAction(slug: string, enabled: boolean) {
  await requireAdmin();
  await patchPackage(slug, { extraContentOverride: enabled });
}

export async function setProductFaqsEnabledAction(slug: string, enabled: boolean) {
  await requireAdmin();
  await patchPackage(slug, { faqsEnabled: enabled });
}

export async function deletePackageAction(formData: FormData) {
  await requireAdmin();
  await deletePackage(String(formData.get("slug") ?? ""));
  redirect("/admin/products?deleted=1");
}

export async function bulkDeletePackagesAction(formData: FormData) {
  await requireAdmin();
  if (String(formData.get("bulk") ?? "") !== "trash") {
    redirect("/admin/products");
  }
  const slugs = formData.getAll("slugs").map(String).filter(Boolean);
  if (slugs.length === 0) {
    redirect("/admin/products");
  }
  await deletePackages(slugs);
  redirect("/admin/products?deleted=1");
}

export async function saveTagAction(formData: FormData) {
  await requireAdmin();
  const originalSlug = String(formData.get("originalSlug") ?? "");
  const saved = await upsertTag({
    originalSlug: originalSlug || undefined,
    slug: String(formData.get("slug") ?? ""),
    name: String(formData.get("name") ?? ""),
    summary: String(formData.get("summary") ?? ""),
  });
  redirect(`/admin/products/tags/${saved.slug}?${originalSlug ? "updated" : "created"}=1`);
}

export async function deleteTagAction(formData: FormData) {
  await requireAdmin();
  await deleteTag(String(formData.get("slug") ?? ""));
  redirect("/admin/products/tags?deleted=1");
}

export async function bulkDeleteTagsAction(formData: FormData) {
  await requireAdmin();
  if (String(formData.get("bulk") ?? "") !== "trash") {
    redirect("/admin/products/tags");
  }
  const slugs = formData.getAll("slugs").map(String).filter(Boolean);
  if (slugs.length === 0) {
    redirect("/admin/products/tags");
  }
  await deleteTags(slugs);
  redirect("/admin/products/tags?deleted=1");
}

export async function saveTabTemplateAction(formData: FormData) {
  await requireAdmin();
  const originalSlug = String(formData.get("originalSlug") ?? "");
  const saved = await upsertTabTemplate({
    originalSlug: originalSlug || undefined,
    slug: String(formData.get("slug") ?? ""),
    name: String(formData.get("name") ?? ""),
    layout: parseLayoutJson(String(formData.get("layout") ?? "[]")),
  });
  redirect(`/admin/templates/${saved.slug}?${originalSlug ? "updated" : "created"}=1`);
}

export async function deleteTabTemplateAction(formData: FormData) {
  await requireAdmin();
  await deleteTabTemplate(String(formData.get("slug") ?? ""));
  redirect("/admin/templates?deleted=1");
}

export async function bulkDeleteTabTemplatesAction(formData: FormData) {
  await requireAdmin();
  if (String(formData.get("bulk") ?? "") !== "trash") {
    redirect("/admin/templates");
  }
  const slugs = formData.getAll("slugs").map(String).filter(Boolean);
  if (slugs.length === 0) {
    redirect("/admin/templates");
  }
  await deleteTabTemplates(slugs);
  redirect("/admin/templates?deleted=1");
}

export async function saveAttributeAction(formData: FormData) {
  await requireAdmin();
  const originalSlug = String(formData.get("originalSlug") ?? "");
  const saved = await upsertAttribute({
    originalSlug: originalSlug || undefined,
    slug: String(formData.get("slug") ?? ""),
    name: String(formData.get("name") ?? ""),
    terms: String(formData.get("terms") ?? "")
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean),
  });
  redirect(`/admin/products/attributes/${saved.slug}?${originalSlug ? "updated" : "created"}=1`);
}

export async function deleteAttributeAction(formData: FormData) {
  await requireAdmin();
  await deleteAttribute(String(formData.get("slug") ?? ""));
  redirect("/admin/products/attributes?deleted=1");
}

export async function bulkDeleteAttributesAction(formData: FormData) {
  await requireAdmin();
  if (String(formData.get("bulk") ?? "") !== "trash") {
    redirect("/admin/products/attributes");
  }
  const slugs = formData.getAll("slugs").map(String).filter(Boolean);
  if (slugs.length === 0) {
    redirect("/admin/products/attributes");
  }
  await deleteAttributes(slugs);
  redirect("/admin/products/attributes?deleted=1");
}

export async function deleteReviewAction(formData: FormData) {
  await requireAdmin();
  await deleteReview(String(formData.get("id") ?? ""));
  redirect("/admin/products/reviews?deleted=1");
}

export async function bulkDeleteReviewsAction(formData: FormData) {
  await requireAdmin();
  if (String(formData.get("bulk") ?? "") !== "trash") {
    redirect("/admin/products/reviews");
  }
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  if (ids.length === 0) {
    redirect("/admin/products/reviews");
  }
  await deleteReviews(ids);
  redirect("/admin/products/reviews?deleted=1");
}

const MAX_CSV_CHARS = 2_000_000;

export async function previewProductCsvAction(csv: string) {
  await requireAdmin();
  if (!csv.trim()) {
    throw new Error("Choose a CSV file.");
  }
  if (csv.length > MAX_CSV_CHARS) {
    throw new Error("CSV is too large. Keep it under 2MB.");
  }
  const { packages, categories } = await readCatalogLive();
  const parsed = parseProductCsv(csv);
  const existing = new Set(packages.map((item) => item.slug));
  return {
    headers: parsed.headers,
    issues: parsed.issues,
    rows: parsed.rows.map((row) => {
      const categoriesResolved = resolveCategorySlugs(row.categoryValues, categories);
      return {
        ...row,
        exists: existing.has(row.slug),
        categorySlugs: categoriesResolved.slugs,
        unknownCategories: categoriesResolved.unknown,
      };
    }),
  };
}

export async function importProductCsvAction(
  csv: string,
  options: { updateExisting: boolean; downloadImages: boolean },
) {
  await requireAdmin();
  if (!csv.trim()) {
    throw new Error("Choose a CSV file.");
  }
  if (csv.length > MAX_CSV_CHARS) {
    throw new Error("CSV is too large. Keep it under 2MB.");
  }
  const parsed = parseProductCsv(csv);
  return importPackages(parsed.rows, options);
}

export async function exportProductsCsvAction() {
  await requireAdmin();
  const { packages, categories } = await readCatalogLive();
  const names = Object.fromEntries(categories.map((item) => [item.slug, item.name]));
  return packagesToCsv(packages, names);
}
