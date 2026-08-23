export type ShopByIndustrySettings = {
  title: string;
  subtitle: string;
  categorySlugs: string[];
};

export const DEFAULT_SHOP_BY_INDUSTRY_TITLE = "Shop by industry";
export const DEFAULT_SHOP_BY_INDUSTRY_SUBTITLE =
  "Custom and graphic packaging solutions for retail, food, cosmetics, and gifts.";

export const DEFAULT_SHOP_BY_INDUSTRY_SLUGS = [
  "boxes-with-lids-industries",
  "apparel-boxes-2",
  "retail-packaging",
  "gift-boxes",
  "food-packaging",
  "cosmetic-boxes",
];

export const DEFAULT_SHOP_BY_INDUSTRY_SETTINGS: ShopByIndustrySettings = {
  title: DEFAULT_SHOP_BY_INDUSTRY_TITLE,
  subtitle: DEFAULT_SHOP_BY_INDUSTRY_SUBTITLE,
  categorySlugs: DEFAULT_SHOP_BY_INDUSTRY_SLUGS,
};

export function normalizeShopByIndustrySettings(
  input?: Partial<ShopByIndustrySettings> | null,
): ShopByIndustrySettings {
  const title =
    typeof input?.title === "string" && input.title.trim()
      ? input.title.trim()
      : DEFAULT_SHOP_BY_INDUSTRY_TITLE;
  const subtitle =
    typeof input?.subtitle === "string" ? input.subtitle.trim() : DEFAULT_SHOP_BY_INDUSTRY_SUBTITLE;

  const source = Array.isArray(input?.categorySlugs)
    ? input.categorySlugs
    : DEFAULT_SHOP_BY_INDUSTRY_SLUGS;

  const seen = new Set<string>();
  const categorySlugs: string[] = [];
  for (const raw of source) {
    if (typeof raw !== "string") {
      continue;
    }
    const slug = raw.trim();
    if (!slug || seen.has(slug)) {
      continue;
    }
    seen.add(slug);
    categorySlugs.push(slug);
  }

  return { title, subtitle, categorySlugs };
}
