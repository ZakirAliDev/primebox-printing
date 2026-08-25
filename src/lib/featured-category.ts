export type FeaturedCategorySlides = {
  base: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type FeaturedCategorySettings = {
  categorySlug: string;
  autoplay: boolean;
  autoplayMs: number;
  slides: FeaturedCategorySlides;
};

export const FEATURED_CATEGORY_TITLE =
  "Build Your Brand With Customized Packing Styles That Grab The Spotlight";
export const FEATURED_CATEGORY_SUBTITLE =
  "We fully comprehend that packaging boxes not only present but also promote products effectively. Crafting a unique brand voice requires a fresh and innovative appearance. 'Box by Style' stands out as a distinctive feature on our official website, guiding you in selecting the perfect style for your delicate, high-selling items. Explore creative concepts and captivate your customers with playful shapes without compromising functionality.";

export const FEATURED_CATEGORY_AUTOPLAY_MS = 5000;
export const FEATURED_CATEGORY_AUTOPLAY_MIN = 1000;
export const FEATURED_CATEGORY_AUTOPLAY_MAX = 20000;
export const FEATURED_CATEGORY_SLIDES_MIN = 1;
export const FEATURED_CATEGORY_SLIDES_MAX = 6;

export const DEFAULT_FEATURED_CATEGORY_SLIDES: FeaturedCategorySlides = {
  base: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
};

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const next = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(next)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(next)));
}

export function normalizeFeaturedCategorySlides(
  input?: Partial<FeaturedCategorySlides> | null,
): FeaturedCategorySlides {
  return {
    base: clampInt(input?.base, DEFAULT_FEATURED_CATEGORY_SLIDES.base, FEATURED_CATEGORY_SLIDES_MIN, FEATURED_CATEGORY_SLIDES_MAX),
    sm: clampInt(input?.sm, DEFAULT_FEATURED_CATEGORY_SLIDES.sm, FEATURED_CATEGORY_SLIDES_MIN, FEATURED_CATEGORY_SLIDES_MAX),
    md: clampInt(input?.md, DEFAULT_FEATURED_CATEGORY_SLIDES.md, FEATURED_CATEGORY_SLIDES_MIN, FEATURED_CATEGORY_SLIDES_MAX),
    lg: clampInt(input?.lg, DEFAULT_FEATURED_CATEGORY_SLIDES.lg, FEATURED_CATEGORY_SLIDES_MIN, FEATURED_CATEGORY_SLIDES_MAX),
    xl: clampInt(input?.xl, DEFAULT_FEATURED_CATEGORY_SLIDES.xl, FEATURED_CATEGORY_SLIDES_MIN, FEATURED_CATEGORY_SLIDES_MAX),
  };
}

export function normalizeFeaturedCategorySettings(
  input?: Partial<FeaturedCategorySettings> | null,
): FeaturedCategorySettings {
  return {
    categorySlug: typeof input?.categorySlug === "string" ? input.categorySlug.trim() : "",
    autoplay: input?.autoplay !== false,
    autoplayMs: clampInt(
      input?.autoplayMs,
      FEATURED_CATEGORY_AUTOPLAY_MS,
      FEATURED_CATEGORY_AUTOPLAY_MIN,
      FEATURED_CATEGORY_AUTOPLAY_MAX,
    ),
    slides: normalizeFeaturedCategorySlides(input?.slides),
  };
}

export const DEFAULT_FEATURED_CATEGORY_SETTINGS: FeaturedCategorySettings =
  normalizeFeaturedCategorySettings();
