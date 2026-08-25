import { normalizeHexColor } from "@/lib/color-scheme";
import { fontFamilyCss, isSiteFont, sanitizeFontFamily } from "@/lib/font-face";

export type SiteTextRole = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "paragraph";

export type SiteTextStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  color: string;
};

export type CardTextSizes = {
  title: number;
  body: number;
};

export type SiteTypographySettings = {
  h1: SiteTextStyle;
  h2: SiteTextStyle;
  h3: SiteTextStyle;
  h4: SiteTextStyle;
  h5: SiteTextStyle;
  h6: SiteTextStyle;
  paragraph: SiteTextStyle;
  productCard: CardTextSizes;
  categoryCard: CardTextSizes;
  customFonts: string[];
};

export const SITE_TEXT_ROLES: SiteTextRole[] = ["h1", "h2", "h3", "h4", "h5", "h6", "paragraph"];

export const SITE_TEXT_ROLE_LABELS: Record<SiteTextRole, string> = {
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  paragraph: "Paragraph",
};

export const SITE_FONT_SIZE_MIN = 10;
export const SITE_FONT_SIZE_MAX = 96;
export const SITE_LINE_HEIGHT_MIN = 0.8;
export const SITE_LINE_HEIGHT_MAX = 3;

const DEFAULT_TEXT_COLOR = "#12315a";

export const DEFAULT_PRODUCT_CARD_SIZES: CardTextSizes = { title: 16, body: 14 };
export const DEFAULT_CATEGORY_CARD_SIZES: CardTextSizes = { title: 20, body: 14 };

export const DEFAULT_SITE_TYPOGRAPHY: SiteTypographySettings = {
  h1: { fontFamily: "sans", fontSize: 36, lineHeight: 1.2, color: DEFAULT_TEXT_COLOR },
  h2: { fontFamily: "sans", fontSize: 30, lineHeight: 1.25, color: DEFAULT_TEXT_COLOR },
  h3: { fontFamily: "sans", fontSize: 24, lineHeight: 1.3, color: DEFAULT_TEXT_COLOR },
  h4: { fontFamily: "sans", fontSize: 20, lineHeight: 1.35, color: DEFAULT_TEXT_COLOR },
  h5: { fontFamily: "sans", fontSize: 18, lineHeight: 1.4, color: DEFAULT_TEXT_COLOR },
  h6: { fontFamily: "sans", fontSize: 16, lineHeight: 1.4, color: DEFAULT_TEXT_COLOR },
  paragraph: { fontFamily: "sans", fontSize: 16, lineHeight: 1.6, color: DEFAULT_TEXT_COLOR },
  productCard: DEFAULT_PRODUCT_CARD_SIZES,
  categoryCard: DEFAULT_CATEGORY_CARD_SIZES,
  customFonts: [],
};

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

function normalizeFontFamily(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  if (isSiteFont(trimmed)) {
    return trimmed;
  }
  return sanitizeFontFamily(trimmed) || fallback;
}

function normalizeTextStyle(input: Partial<SiteTextStyle> | null | undefined, fallback: SiteTextStyle): SiteTextStyle {
  return {
    fontFamily: normalizeFontFamily(input?.fontFamily, fallback.fontFamily),
    fontSize: Math.round(
      clampNumber(input?.fontSize, fallback.fontSize, SITE_FONT_SIZE_MIN, SITE_FONT_SIZE_MAX),
    ),
    lineHeight: Number(
      clampNumber(input?.lineHeight, fallback.lineHeight, SITE_LINE_HEIGHT_MIN, SITE_LINE_HEIGHT_MAX).toFixed(2),
    ),
    color: normalizeHexColor(input?.color, fallback.color),
  };
}

function normalizeCardTextSizes(
  input: Partial<CardTextSizes> | null | undefined,
  fallback: CardTextSizes,
): CardTextSizes {
  return {
    title: Math.round(clampNumber(input?.title, fallback.title, SITE_FONT_SIZE_MIN, SITE_FONT_SIZE_MAX)),
    body: Math.round(clampNumber(input?.body, fallback.body, SITE_FONT_SIZE_MIN, SITE_FONT_SIZE_MAX)),
  };
}

function normalizeCustomFonts(raw: unknown, usedFamilies: string[]) {
  const list = Array.isArray(raw) ? raw : [];
  const names = [...list, ...usedFamilies]
    .map((item) => (typeof item === "string" ? sanitizeFontFamily(item) : ""))
    .filter(Boolean);
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const name of names) {
    const key = name.toLowerCase();
    if (seen.has(key) || isSiteFont(name)) {
      continue;
    }
    seen.add(key);
    unique.push(name);
  }
  return unique;
}

export function normalizeSiteTypography(
  input?: Partial<SiteTypographySettings> | null,
): SiteTypographySettings {
  const next = {
    h1: normalizeTextStyle(input?.h1, DEFAULT_SITE_TYPOGRAPHY.h1),
    h2: normalizeTextStyle(input?.h2, DEFAULT_SITE_TYPOGRAPHY.h2),
    h3: normalizeTextStyle(input?.h3, DEFAULT_SITE_TYPOGRAPHY.h3),
    h4: normalizeTextStyle(input?.h4, DEFAULT_SITE_TYPOGRAPHY.h4),
    h5: normalizeTextStyle(input?.h5, DEFAULT_SITE_TYPOGRAPHY.h5),
    h6: normalizeTextStyle(input?.h6, DEFAULT_SITE_TYPOGRAPHY.h6),
    paragraph: normalizeTextStyle(input?.paragraph, DEFAULT_SITE_TYPOGRAPHY.paragraph),
    productCard: normalizeCardTextSizes(input?.productCard, DEFAULT_PRODUCT_CARD_SIZES),
    categoryCard: normalizeCardTextSizes(input?.categoryCard, DEFAULT_CATEGORY_CARD_SIZES),
    customFonts: [] as string[],
  };
  next.customFonts = normalizeCustomFonts(input?.customFonts, SITE_TEXT_ROLES.map((role) => next[role].fontFamily));
  return next;
}

export function collectSiteTypographyFamilies(settings: SiteTypographySettings): string[] {
  return SITE_TEXT_ROLES.map((role) => settings[role].fontFamily);
}

export function siteTypographyCssVars(settings: SiteTypographySettings): Record<string, string> {
  const next: Record<string, string> = {};
  for (const role of SITE_TEXT_ROLES) {
    const style = settings[role];
    const prefix = `--type-${role}`;
    next[`${prefix}-ff`] = fontFamilyCss(style.fontFamily);
    next[`${prefix}-fs`] = `${style.fontSize}px`;
    next[`${prefix}-lh`] = String(style.lineHeight);
    next[`${prefix}-color`] = style.color;
  }
  next["--type-product-card-title-fs"] = `${settings.productCard.title}px`;
  next["--type-product-card-body-fs"] = `${settings.productCard.body}px`;
  next["--type-category-card-title-fs"] = `${settings.categoryCard.title}px`;
  next["--type-category-card-body-fs"] = `${settings.categoryCard.body}px`;
  return next;
}

export function siteTypographyCssRules(): string {
  const headingRules = (["h1", "h2", "h3", "h4", "h5", "h6"] as const)
    .map(
      (tag) =>
        `.site-theme ${tag}{font-family:var(--type-${tag}-ff);font-size:var(--type-${tag}-fs);line-height:var(--type-${tag}-lh);color:var(--type-${tag}-color)}`,
    )
    .join("");
  const paragraphRule =
    ".site-theme p{font-family:var(--type-paragraph-ff);font-size:var(--type-paragraph-fs);line-height:var(--type-paragraph-lh);color:var(--type-paragraph-color)}";
  const productCardRules =
    ".site-theme .related-product-card:not(.category-card) h3{font-size:var(--type-product-card-title-fs)}" +
    ".site-theme .related-product-card:not(.category-card) p{font-size:var(--type-product-card-body-fs)}";
  const categoryCardRules =
    ".site-theme .category-card h3{font-size:var(--type-category-card-title-fs)}" +
    ".site-theme .category-card p,.site-theme .category-card .category-card__supporting{font-size:var(--type-category-card-body-fs)}";
  return `${headingRules}${paragraphRule}${productCardRules}${categoryCardRules}`;
}
