import type { ColorScheme } from "@/lib/color-scheme";
import {
  DEFAULT_LINK_TRANSITION_MS,
  normalizeColorScheme,
  normalizeLinkTransitionMs,
} from "@/lib/color-scheme";
import {
  DEFAULT_SITE_TYPOGRAPHY,
  normalizeSiteTypography,
  type SiteTypographySettings,
} from "@/lib/site-typography";
import { DEFAULT_HERO_SETTINGS, normalizeHeroSettings, type HeroSettings } from "@/lib/hero-slides";
import {
  DEFAULT_PROMO_BAR_SETTINGS,
  normalizePromoBarSettings,
  type PromoBarSettings,
} from "@/lib/promo-bar";
import {
  DEFAULT_SHOP_BY_INDUSTRY_SETTINGS,
  normalizeShopByIndustrySettings,
  type ShopByIndustrySettings,
} from "@/lib/shop-by-industry";
import {
  DEFAULT_TRUST_BAR_SETTINGS,
  normalizeTrustBarSettings,
  type TrustBarSettings,
} from "@/lib/trust-bar";
import {
  DEFAULT_FEATURED_CATEGORY_SETTINGS,
  normalizeFeaturedCategorySettings,
  type FeaturedCategorySettings,
} from "@/lib/featured-category";
import {
  DEFAULT_HOME_TESTIMONIALS_SETTINGS,
  normalizeHomeTestimonialsSettings,
  type HomeTestimonialsSettings,
} from "@/lib/home-testimonials";
import { defaultAppearance, htmlToLayout, normalizeLayout, type TemplateSection } from "@/lib/template-layout";

export type Category = {
  slug: string;
  name: string;
  /** Short description on home Shop by industry cards (2 lines). */
  summary: string;
  /** Full description under the title on the category page. */
  description: string;
  /** Supporting text on home Shop by industry category cards. */
  cardSupportingText: string;
  /** Image on home Shop by industry cards. Not shown on the category page. */
  image: string;
  parentSlug: string;
};

export type RelatedMode = "category" | "manual";

export type ProductFaq = {
  question: string;
  answer: string;
};

export type TabSource = "custom" | "template";

export type TabTemplate = {
  slug: string;
  name: string;
  layout: TemplateSection[];
};

export type ProductTab = {
  title: string;
  source: TabSource;
  template?: string;
  content: string;
};

export type Package = {
  slug: string;
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
};

export type ExtraContentAlign = "left" | "center" | "right";

export type SiteSettings = {
  favicon: string;
  logo: string;
  logoInHeader: boolean;
  logoInFooter: boolean;
  logoHeaderHeight: number;
  logoFooterHeight: number;
  separateFooterLogo: boolean;
  footerLogo: string;
  colors: ColorScheme;
  linkTransitionMs: number;
  typography: SiteTypographySettings;
  promoBar: PromoBarSettings;
  trustBar: TrustBarSettings;
  shopByIndustry: ShopByIndustrySettings;
  featuredCategory: FeaturedCategorySettings;
  testimonials: HomeTestimonialsSettings;
  hero: HeroSettings;
};

export type RelatedCarouselSlides = {
  base: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type ProductPageSettings = {
  globalTabsEnabled: boolean;
  globalTabs: ProductTab[];
  globalFaqsEnabled: boolean;
  globalFaqs: ProductFaq[];
  globalExtraContentEnabled: boolean;
  globalExtraContent: string;
  extraContentAlign: ExtraContentAlign;
  extraContentAnimationMs: number;
  extraContentCollapsedHeight: number;
  relatedCarouselSlides: RelatedCarouselSlides;
  relatedCarouselAutoplay: boolean;
  relatedCarouselAutoplayMs: number;
};

export type CategorySidebarPosition = "left" | "right";

export type CategoryPaginationStyle = "numbered" | "prev-next" | "compact" | "load-more";

export type CategoryGridColumns = {
  base: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
};

export type CategoryPageSettings = {
  sidebarEnabled: boolean;
  sidebarPosition: CategorySidebarPosition;
  productGridColumns: CategoryGridColumns;
  paginationEnabled: boolean;
  productsPerPage: number;
  paginationStyle: CategoryPaginationStyle;
};

export type Tag = {
  slug: string;
  name: string;
  summary: string;
};

export type ProductAttribute = {
  slug: string;
  name: string;
  terms: string[];
};

export type ProductReview = {
  id: string;
  productSlug: string;
  author: string;
  rating: number;
  content: string;
  createdAt: string;
};

export type Catalog = {
  categories: Category[];
  packages: Package[];
  tabTemplates: TabTemplate[];
  tags: Tag[];
  attributes: ProductAttribute[];
  reviews: ProductReview[];
  productPageSettings: ProductPageSettings;
  categoryPageSettings: CategoryPageSettings;
  siteSettings: SiteSettings;
};

export const DEFAULT_SPECS = [
  { label: "Dimensions", value: "All custom sizes" },
  { label: "Printing", value: "CMYK, PMS, or no printing" },
  { label: "Paper stock", value: "10pt to 28pt (60lb to 400lb), kraft, E-flute, bux board, cardstock" },
  { label: "Quantities", value: "100 – 500,000" },
  { label: "Coating", value: "Gloss, matte, spot UV" },
  { label: "Default process", value: "Die cutting, gluing, scoring, perforation" },
  { label: "Options", value: "Window cut-out, gold/silver foiling, embossing, raised ink, PVC sheet" },
  { label: "Proof", value: "Flat view, 3D mock-up, physical sampling on request" },
] as const;

export const TAB_TEMPLATE_COPY = {
  materials:
    "Duplex chipboard, grey chipboard, black-kraft, holographic, metallic, natural brown kraft, textured, and white kraft.",
  printing: "Digital, offset, Scodix enhancement, and UV print.",
  finishing:
    "Pantone, soy, fluorescent, and metallic inks. Soft-touch, lamination, spot UV, foil, embossing, debossing, PVC patch, and ribbon handles.",
} as const;

export const DEFAULT_TAB_TEMPLATES: TabTemplate[] = [
  {
    slug: "specifications",
    name: "Specifications",
    layout: [
      {
        id: "default-specs-section",
        columns: [
          {
            id: "default-specs-col",
            span: 12,
            widgets: [
              {
                id: "default-specs-list",
                type: "spec-list",
                appearance: { lg: defaultAppearance() },
                rows: DEFAULT_SPECS.map((spec) => ({ label: spec.label, value: spec.value })),
              },
            ],
          },
        ],
      },
    ],
  },
  starterCopyTemplate("materials", "Material / paper stock", "layers", TAB_TEMPLATE_COPY.materials),
  starterCopyTemplate("printing", "Printing methods", "print", TAB_TEMPLATE_COPY.printing),
  starterCopyTemplate("finishing", "Inks, finishing, add-ons", "star", TAB_TEMPLATE_COPY.finishing),
];

function starterCopyTemplate(
  slug: string,
  name: string,
  icon: "layers" | "print" | "star",
  copy: string,
): TabTemplate {
  return {
    slug,
    name,
    layout: [
      {
        id: `default-${slug}-section`,
        columns: [
          {
            id: `default-${slug}-icon`,
            span: 4,
            widgets: [{ id: `default-${slug}-icon-w`, type: "icon", appearance: { lg: defaultAppearance() }, name: icon, label: name }],
          },
          {
            id: `default-${slug}-copy`,
            span: 8,
            widgets: [{ id: `default-${slug}-text`, type: "text", appearance: { lg: defaultAppearance() }, html: `<p>${copy}</p>` }],
          },
        ],
      },
    ],
  };
}

export function normalizeTabTemplate(item: {
  slug?: string;
  name?: string;
  layout?: unknown;
  content?: string;
}): TabTemplate {
  const hasLayout = Array.isArray(item.layout);
  return {
    slug: item.slug ?? "",
    name: item.name ?? "",
    layout: hasLayout ? normalizeLayout(item.layout) : htmlToLayout(item.content ?? ""),
  };
}

export function normalizePackage(item: Package): Package {
  const relatedSlugs = item.relatedSlugs ?? [];
  return {
    ...item,
    image: item.image ?? "",
    gallery: item.gallery ?? [],
    relatedSlugs,
    relatedMode: item.relatedMode ?? (relatedSlugs.length > 0 ? "manual" : "category"),
    faqs: (item.faqs ?? []).filter((faq) => faq.question?.trim() && faq.answer?.trim()),
    faqsEnabled: item.faqsEnabled !== false,
    faqsOverride: Boolean(item.faqsOverride),
    extraContent: item.extraContent ?? "",
    extraContentOverride: Boolean(item.extraContentOverride),
    tabs: (item.tabs ?? []).map(normalizeTab).filter((tab) => tab.title.trim()),
    tabsOverride: Boolean(item.tabsOverride),
  };
}

export function normalizeCategory(item: Category | (Partial<Category> & Pick<Category, "slug" | "name">)): Category {
  return {
    slug: item.slug ?? "",
    name: item.name ?? "",
    summary: item.summary ?? "",
    description: typeof item.description === "string" ? item.description.trim() : "",
    cardSupportingText:
      typeof item.cardSupportingText === "string" ? item.cardSupportingText.trim() : "",
    image: item.image?.trim() ?? "",
    parentSlug: item.parentSlug?.trim() ?? "",
  };
}

export function categoryDepth(categories: Category[], slug: string) {
  let depth = 0;
  let current = categories.find((entry) => entry.slug === slug);
  const seen = new Set<string>();
  while (current?.parentSlug) {
    if (seen.has(current.parentSlug)) {
      break;
    }
    seen.add(current.parentSlug);
    depth += 1;
    current = categories.find((entry) => entry.slug === current?.parentSlug);
  }
  return depth;
}

export function orderedCategories(categories: Category[]) {
  const byParent = new Map<string, Category[]>();
  for (const category of categories.map(normalizeCategory)) {
    const key = category.parentSlug || "";
    const group = byParent.get(key) ?? [];
    group.push(category);
    byParent.set(key, group);
  }
  for (const group of byParent.values()) {
    group.sort((a, b) => a.name.localeCompare(b.name));
  }

  const ordered: Category[] = [];
  const walk = (parentSlug: string) => {
    for (const category of byParent.get(parentSlug) ?? []) {
      ordered.push(category);
      walk(category.slug);
    }
  };
  walk("");
  return ordered;
}

export function categoryParentChoices(categories: Category[], excludeSlug?: string) {
  const blocked = new Set<string>();
  if (excludeSlug) {
    blocked.add(excludeSlug);
    const descendants = new Set<string>();
    const walk = (parent: string) => {
      for (const category of categories) {
        if (category.parentSlug === parent && !descendants.has(category.slug)) {
          descendants.add(category.slug);
          blocked.add(category.slug);
          walk(category.slug);
        }
      }
    };
    walk(excludeSlug);
  }
  return orderedCategories(categories).filter((category) => !blocked.has(category.slug));
}

export function categoryChildren(categories: Category[], parentSlug: string) {
  return categories
    .filter((category) => category.parentSlug === parentSlug)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function categoryBreadcrumbs(categories: Category[], slug: string) {
  const crumbs: Category[] = [];
  let current = categories.find((entry) => entry.slug === slug);
  const seen = new Set<string>();
  while (current) {
    crumbs.unshift(current);
    if (!current.parentSlug || seen.has(current.parentSlug)) {
      break;
    }
    seen.add(current.parentSlug);
    current = categories.find((entry) => entry.slug === current?.parentSlug);
  }
  return crumbs;
}

export function isCategoryParentInvalid(categories: Category[], slug: string, parentSlug: string) {
  if (!parentSlug) {
    return false;
  }
  if (parentSlug === slug) {
    return true;
  }
  if (!categories.some((entry) => entry.slug === parentSlug)) {
    return true;
  }
  let current = categories.find((entry) => entry.slug === parentSlug);
  const seen = new Set<string>();
  while (current?.parentSlug) {
    if (current.parentSlug === slug) {
      return true;
    }
    if (seen.has(current.parentSlug)) {
      break;
    }
    seen.add(current.parentSlug);
    current = categories.find((entry) => entry.slug === current?.parentSlug);
  }
  return false;
}

export const RELATED_LIMIT = 12;

export const DEFAULT_LOGO_HEIGHT = 40;
export const LOGO_HEIGHT_MIN = 16;
export const LOGO_HEIGHT_MAX = 500;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  favicon: "",
  logo: "",
  logoInHeader: true,
  logoInFooter: true,
  logoHeaderHeight: DEFAULT_LOGO_HEIGHT,
  logoFooterHeight: DEFAULT_LOGO_HEIGHT,
  separateFooterLogo: false,
  footerLogo: "",
  colors: normalizeColorScheme(),
  linkTransitionMs: DEFAULT_LINK_TRANSITION_MS,
  typography: DEFAULT_SITE_TYPOGRAPHY,
  promoBar: DEFAULT_PROMO_BAR_SETTINGS,
  trustBar: DEFAULT_TRUST_BAR_SETTINGS,
  shopByIndustry: DEFAULT_SHOP_BY_INDUSTRY_SETTINGS,
  featuredCategory: DEFAULT_FEATURED_CATEGORY_SETTINGS,
  testimonials: DEFAULT_HOME_TESTIMONIALS_SETTINGS,
  hero: DEFAULT_HERO_SETTINGS,
};

export function normalizeSiteSettings(input?: Partial<SiteSettings> | null): SiteSettings {
  return {
    favicon: typeof input?.favicon === "string" ? input.favicon.trim() : "",
    logo: typeof input?.logo === "string" ? input.logo.trim() : "",
    logoInHeader: input?.logoInHeader !== false,
    logoInFooter: input?.logoInFooter !== false,
    logoHeaderHeight: clampInt(input?.logoHeaderHeight, DEFAULT_LOGO_HEIGHT, LOGO_HEIGHT_MIN, LOGO_HEIGHT_MAX),
    logoFooterHeight: clampInt(input?.logoFooterHeight, DEFAULT_LOGO_HEIGHT, LOGO_HEIGHT_MIN, LOGO_HEIGHT_MAX),
    separateFooterLogo: input?.separateFooterLogo === true,
    footerLogo: typeof input?.footerLogo === "string" ? input.footerLogo.trim() : "",
    colors: normalizeColorScheme(input?.colors),
    linkTransitionMs: normalizeLinkTransitionMs(input?.linkTransitionMs),
    typography: normalizeSiteTypography(input?.typography),
    promoBar: normalizePromoBarSettings(input?.promoBar),
    trustBar: normalizeTrustBarSettings(input?.trustBar),
    shopByIndustry: normalizeShopByIndustrySettings(input?.shopByIndustry),
    featuredCategory: normalizeFeaturedCategorySettings(input?.featuredCategory),
    testimonials: normalizeHomeTestimonialsSettings(input?.testimonials),
    hero: normalizeHeroSettings(input?.hero),
  };
}

/** Logo shown in the site footer (shared or separate). */
export function resolveFooterLogo(settings: Pick<SiteSettings, "logo" | "separateFooterLogo" | "footerLogo" | "logoInFooter">) {
  if (!settings.logoInFooter) {
    return "";
  }
  if (settings.separateFooterLogo) {
    return settings.footerLogo.trim();
  }
  return settings.logo.trim();
}

export const DEFAULT_EXTRA_CONTENT_ALIGN: ExtraContentAlign = "center";
export const DEFAULT_EXTRA_CONTENT_ANIMATION_MS = 1500;
export const DEFAULT_EXTRA_CONTENT_COLLAPSED_HEIGHT = 400;

export const RELATED_CAROUSEL_SLIDES_MIN = 1;
export const RELATED_CAROUSEL_SLIDES_MAX = 6;

export const DEFAULT_RELATED_CAROUSEL_SLIDES: RelatedCarouselSlides = {
  base: 1,
  sm: 2,
  md: 2,
  lg: 3,
  xl: 3,
};

export const RELATED_CAROUSEL_AUTOPLAY_MS = 5000;
export const RELATED_CAROUSEL_AUTOPLAY_MIN = 1000;
export const RELATED_CAROUSEL_AUTOPLAY_MAX = 20000;

export const CATEGORY_GRID_COLUMNS_MIN = 1;
export const CATEGORY_GRID_COLUMNS_MAX = 4;

export const CATEGORY_PRODUCTS_PER_PAGE_DEFAULT = 12;
export const CATEGORY_PRODUCTS_PER_PAGE_MIN = 1;
export const CATEGORY_PRODUCTS_PER_PAGE_MAX = 48;

export const CATEGORY_PAGINATION_STYLES: {
  value: CategoryPaginationStyle;
  label: string;
  description: string;
}[] = [
  {
    value: "numbered",
    label: "Numbered",
    description: "Previous, numbered page links, and Next.",
  },
  {
    value: "prev-next",
    label: "Previous / Next",
    description: "Simple back and forward links without page numbers.",
  },
  {
    value: "compact",
    label: "Compact",
    description: "Previous and Next with the current page count in the center.",
  },
  {
    value: "load-more",
    label: "Load more",
    description: "Append more products on the same page when the button is clicked.",
  },
];

export const DEFAULT_CATEGORY_GRID_COLUMNS: CategoryGridColumns = {
  base: 1,
  sm: 2,
  md: 2,
  lg: 3,
  xl: 3,
  "2xl": 3,
};

export const DEFAULT_CATEGORY_PAGE_SETTINGS: CategoryPageSettings = {
  sidebarEnabled: true,
  sidebarPosition: "left",
  productGridColumns: DEFAULT_CATEGORY_GRID_COLUMNS,
  paginationEnabled: true,
  productsPerPage: CATEGORY_PRODUCTS_PER_PAGE_DEFAULT,
  paginationStyle: "numbered",
};

export const DEFAULT_PRODUCT_PAGE_SETTINGS: ProductPageSettings = {
  globalTabsEnabled: false,
  globalTabs: [],
  globalFaqsEnabled: false,
  globalFaqs: [],
  globalExtraContentEnabled: false,
  globalExtraContent: "",
  extraContentAlign: DEFAULT_EXTRA_CONTENT_ALIGN,
  extraContentAnimationMs: DEFAULT_EXTRA_CONTENT_ANIMATION_MS,
  extraContentCollapsedHeight: DEFAULT_EXTRA_CONTENT_COLLAPSED_HEIGHT,
  relatedCarouselSlides: DEFAULT_RELATED_CAROUSEL_SLIDES,
  relatedCarouselAutoplay: true,
  relatedCarouselAutoplayMs: RELATED_CAROUSEL_AUTOPLAY_MS,
};

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function normalizeExtraContentAlign(value: unknown): ExtraContentAlign {
  return value === "left" || value === "right" ? value : DEFAULT_EXTRA_CONTENT_ALIGN;
}

export function normalizeRelatedCarouselSlides(input?: Partial<RelatedCarouselSlides> | null): RelatedCarouselSlides {
  return {
    base: clampInt(input?.base, DEFAULT_RELATED_CAROUSEL_SLIDES.base, RELATED_CAROUSEL_SLIDES_MIN, RELATED_CAROUSEL_SLIDES_MAX),
    sm: clampInt(input?.sm, DEFAULT_RELATED_CAROUSEL_SLIDES.sm, RELATED_CAROUSEL_SLIDES_MIN, RELATED_CAROUSEL_SLIDES_MAX),
    md: clampInt(input?.md, DEFAULT_RELATED_CAROUSEL_SLIDES.md, RELATED_CAROUSEL_SLIDES_MIN, RELATED_CAROUSEL_SLIDES_MAX),
    lg: clampInt(input?.lg, DEFAULT_RELATED_CAROUSEL_SLIDES.lg, RELATED_CAROUSEL_SLIDES_MIN, RELATED_CAROUSEL_SLIDES_MAX),
    xl: clampInt(input?.xl, DEFAULT_RELATED_CAROUSEL_SLIDES.xl, RELATED_CAROUSEL_SLIDES_MIN, RELATED_CAROUSEL_SLIDES_MAX),
  };
}

export function normalizeCategoryGridColumns(input?: Partial<CategoryGridColumns> | null): CategoryGridColumns {
  return {
    base: clampInt(input?.base, DEFAULT_CATEGORY_GRID_COLUMNS.base, CATEGORY_GRID_COLUMNS_MIN, CATEGORY_GRID_COLUMNS_MAX),
    sm: clampInt(input?.sm, DEFAULT_CATEGORY_GRID_COLUMNS.sm, CATEGORY_GRID_COLUMNS_MIN, CATEGORY_GRID_COLUMNS_MAX),
    md: clampInt(input?.md, DEFAULT_CATEGORY_GRID_COLUMNS.md, CATEGORY_GRID_COLUMNS_MIN, CATEGORY_GRID_COLUMNS_MAX),
    lg: clampInt(input?.lg, DEFAULT_CATEGORY_GRID_COLUMNS.lg, CATEGORY_GRID_COLUMNS_MIN, CATEGORY_GRID_COLUMNS_MAX),
    xl: clampInt(input?.xl, DEFAULT_CATEGORY_GRID_COLUMNS.xl, CATEGORY_GRID_COLUMNS_MIN, CATEGORY_GRID_COLUMNS_MAX),
    "2xl": clampInt(input?.["2xl"], DEFAULT_CATEGORY_GRID_COLUMNS["2xl"], CATEGORY_GRID_COLUMNS_MIN, CATEGORY_GRID_COLUMNS_MAX),
  };
}

export function normalizeCategorySidebarPosition(value: unknown): CategorySidebarPosition {
  return value === "right" ? "right" : "left";
}

export function normalizeCategoryPaginationStyle(value: unknown): CategoryPaginationStyle {
  if (value === "prev-next" || value === "compact" || value === "load-more") {
    return value;
  }
  return "numbered";
}

export function normalizeCategoryPageSettings(input?: Partial<CategoryPageSettings> | null): CategoryPageSettings {
  return {
    sidebarEnabled: input?.sidebarEnabled !== false,
    sidebarPosition: normalizeCategorySidebarPosition(input?.sidebarPosition),
    productGridColumns: normalizeCategoryGridColumns(input?.productGridColumns),
    paginationEnabled: input?.paginationEnabled !== false,
    productsPerPage: clampInt(
      input?.productsPerPage,
      CATEGORY_PRODUCTS_PER_PAGE_DEFAULT,
      CATEGORY_PRODUCTS_PER_PAGE_MIN,
      CATEGORY_PRODUCTS_PER_PAGE_MAX,
    ),
    paginationStyle: normalizeCategoryPaginationStyle(input?.paginationStyle),
  };
}

export function parseCategoryPageNumber(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

export function paginateCategoryProducts<T>(items: T[], page: number, perPage: number, enabled: boolean) {
  if (!enabled || items.length === 0) {
    return { items, currentPage: 1, totalPages: 1 };
  }

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentPage = Math.min(parseCategoryPageNumber(page), totalPages);
  const start = (currentPage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    currentPage,
    totalPages,
  };
}

const CATEGORY_GRID_CSS_VARS = [
  ["--category-grid-cols-base", "base"],
  ["--category-grid-cols-sm", "sm"],
  ["--category-grid-cols-md", "md"],
  ["--category-grid-cols-lg", "lg"],
  ["--category-grid-cols-xl", "xl"],
  ["--category-grid-cols-2xl", "2xl"],
] as const;

export function categoryProductGridVars(columns: CategoryGridColumns): Record<string, string> {
  const normalized = normalizeCategoryGridColumns(columns);
  return Object.fromEntries(
    CATEGORY_GRID_CSS_VARS.map(([cssVar, key]) => [cssVar, String(normalized[key])]),
  );
}

export function normalizeProductPageSettings(input?: Partial<ProductPageSettings> | null): ProductPageSettings {
  return {
    globalTabsEnabled: Boolean(input?.globalTabsEnabled),
    globalTabs: (input?.globalTabs ?? []).map(normalizeTab).filter((tab) => tab.title.trim()),
    globalFaqsEnabled: Boolean(input?.globalFaqsEnabled),
    globalFaqs: (input?.globalFaqs ?? []).filter((faq) => faq.question?.trim() && faq.answer?.trim()),
    globalExtraContentEnabled: Boolean(input?.globalExtraContentEnabled),
    globalExtraContent: input?.globalExtraContent ?? "",
    extraContentAlign: normalizeExtraContentAlign(input?.extraContentAlign),
    extraContentAnimationMs: clampInt(
      input?.extraContentAnimationMs,
      DEFAULT_EXTRA_CONTENT_ANIMATION_MS,
      200,
      5000,
    ),
    extraContentCollapsedHeight: clampInt(
      input?.extraContentCollapsedHeight,
      DEFAULT_EXTRA_CONTENT_COLLAPSED_HEIGHT,
      80,
      1200,
    ),
    relatedCarouselSlides: normalizeRelatedCarouselSlides(input?.relatedCarouselSlides),
    relatedCarouselAutoplay: input?.relatedCarouselAutoplay !== false,
    relatedCarouselAutoplayMs: clampInt(
      input?.relatedCarouselAutoplayMs,
      RELATED_CAROUSEL_AUTOPLAY_MS,
      RELATED_CAROUSEL_AUTOPLAY_MIN,
      RELATED_CAROUSEL_AUTOPLAY_MAX,
    ),
  };
}

export function resolveProductTabs(product: Package, settings: ProductPageSettings): ProductTab[] {
  if (!settings.globalTabsEnabled || product.tabsOverride) {
    return product.tabs;
  }
  return settings.globalTabs;
}

export function resolveProductFaqs(product: Package, settings: ProductPageSettings): ProductFaq[] {
  if (!settings.globalFaqsEnabled || product.faqsOverride) {
    return product.faqsEnabled ? product.faqs : [];
  }
  return settings.globalFaqs;
}

export function resolveProductExtraContent(product: Package, settings: ProductPageSettings): string {
  if (!settings.globalExtraContentEnabled || product.extraContentOverride) {
    return product.extraContent;
  }
  return settings.globalExtraContent;
}

function normalizeTab(tab: ProductTab): ProductTab {
  const source = tab.source === "template" ? "template" : "custom";
  const template = tab.template?.trim() || undefined;
  return {
    title: tab.title.trim(),
    source: source === "template" && template ? "template" : "custom",
    template: source === "template" ? template : undefined,
    content: tab.content ?? "",
  };
}

export function packageCoverImage(item: Pick<Package, "image" | "gallery">) {
  const image = item.image?.trim();
  if (image) {
    return image;
  }
  return item.gallery?.find((src) => src.trim()) ?? "";
}

export function relatedPackages(item: Package, allPackages: Package[]) {
  if (item.relatedMode === "manual") {
    const seen = new Set<string>();
    return item.relatedSlugs
      .map((slug) => allPackages.find((entry) => entry.slug === slug))
      .filter((related): related is Package => {
        if (!related || related.slug === item.slug || seen.has(related.slug)) {
          return false;
        }
        seen.add(related.slug);
        return true;
      });
  }

  const categories = new Set(item.categorySlugs);
  const pool = allPackages.filter(
    (entry) => entry.slug !== item.slug && entry.categorySlugs.some((slug) => categories.has(slug)),
  );
  return shufflePackages(pool, item.slug).slice(0, RELATED_LIMIT);
}

function shufflePackages(items: Package[], seed: string) {
  const next = [...items];
  let state = 0;
  for (const char of seed) {
    state = (state * 31 + char.charCodeAt(0)) >>> 0;
  }
  if (state === 0) {
    state = 1;
  }
  for (let index = next.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = state % (index + 1);
    const current = next[index];
    next[index] = next[swap];
    next[swap] = current;
  }
  return next;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
