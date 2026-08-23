export type PromoBarSlide = {
  id: string;
  text: string;
};

export type PromoBarSettings = {
  autoplay: boolean;
  autoplayMs: number;
  slides: PromoBarSlide[];
};

export const PROMO_BAR_AUTOPLAY_MS = 5000;
export const PROMO_BAR_AUTOPLAY_MIN = 1000;
export const PROMO_BAR_AUTOPLAY_MAX = 20000;
export const PROMO_BAR_TRANSITION_MS = 400;

export const DEFAULT_PROMO_BAR_SLIDES: PromoBarSlide[] = [
  {
    id: "labour-day",
    text: "Labour Day discount — up to 30% off",
  },
];

export const DEFAULT_PROMO_BAR_SETTINGS: PromoBarSettings = {
  autoplay: true,
  autoplayMs: PROMO_BAR_AUTOPLAY_MS,
  slides: DEFAULT_PROMO_BAR_SLIDES,
};

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const next = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(next)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(next)));
}

export function createPromoBarSlide(text = ""): PromoBarSlide {
  return {
    id: `promo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    text,
  };
}

export function normalizePromoBarSlide(input?: Partial<PromoBarSlide> | null): PromoBarSlide | null {
  const text = typeof input?.text === "string" ? input.text.trim() : "";
  if (!text) {
    return null;
  }
  const id =
    typeof input?.id === "string" && input.id.trim()
      ? input.id.trim()
      : createPromoBarSlide(text).id;
  return { id, text };
}

export function normalizePromoBarSettings(input?: Partial<PromoBarSettings> | null): PromoBarSettings {
  const source = Array.isArray(input?.slides) ? input.slides : DEFAULT_PROMO_BAR_SLIDES;
  const slides = source
    .map((slide) => normalizePromoBarSlide(slide))
    .filter((slide): slide is PromoBarSlide => Boolean(slide));

  return {
    autoplay: input?.autoplay !== false,
    autoplayMs: clampInt(
      input?.autoplayMs,
      PROMO_BAR_AUTOPLAY_MS,
      PROMO_BAR_AUTOPLAY_MIN,
      PROMO_BAR_AUTOPLAY_MAX,
    ),
    slides,
  };
}

export function promoBarLoopSlides(slides: PromoBarSlide[]) {
  if (slides.length === 0) {
    return [];
  }
  return [slides[slides.length - 1], ...slides, slides[0]];
}

export function promoBarSnapIndex(loopIndex: number, length: number) {
  if (length === 0) {
    return 0;
  }
  if (loopIndex === 0) {
    return length;
  }
  if (loopIndex === length + 1) {
    return 1;
  }
  return loopIndex;
}
