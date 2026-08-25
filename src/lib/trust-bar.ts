export type TrustBarImage = {
  id: string;
  image: string;
  href: string;
  alt: string;
};

export type TrustBarCarouselSettings = {
  slides: TrustBarImage[];
  autoplay: boolean;
  autoplayMs: number;
  slidesToShowDesktop: number;
  slidesToShowMobile: number;
};

export type TrustBarSettings = {
  stills: [TrustBarImage, TrustBarImage];
  stillHeight: number;
  slideHeight: number;
  carousel: TrustBarCarouselSettings;
};

export const TRUST_BAR_AUTOPLAY_MS = 5000;
export const TRUST_BAR_AUTOPLAY_MIN = 1000;
export const TRUST_BAR_AUTOPLAY_MAX = 20000;
export const TRUST_BAR_TRANSITION_MS = 400;
export const TRUST_BAR_SLIDES_DESKTOP_DEFAULT = 7;
export const TRUST_BAR_SLIDES_MOBILE_DEFAULT = 3;
export const TRUST_BAR_SLIDES_SHOW_MIN = 1;
export const TRUST_BAR_SLIDES_SHOW_MAX = 12;
export const TRUST_BAR_IMAGE_HEIGHT_DEFAULT = 64;
export const TRUST_BAR_IMAGE_HEIGHT_MIN = 24;
export const TRUST_BAR_IMAGE_HEIGHT_MAX = 160;

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const next = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(next)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(next)));
}

export function createTrustBarSlide(
  input?: Partial<Pick<TrustBarImage, "image" | "href" | "alt">>,
): TrustBarImage {
  return {
    id: `trust-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    image: typeof input?.image === "string" ? input.image.trim() : "",
    href: typeof input?.href === "string" ? input.href.trim() : "",
    alt: typeof input?.alt === "string" ? input.alt.trim() : "",
  };
}

export function emptyTrustBarStill(): TrustBarImage {
  return createTrustBarSlide();
}

export function normalizeTrustBarImage(
  input?: Partial<TrustBarImage> | null,
  options?: { requireImage?: boolean },
): TrustBarImage | null {
  const image = typeof input?.image === "string" ? input.image.trim() : "";
  if (options?.requireImage && !image) {
    return null;
  }
  const id =
    typeof input?.id === "string" && input.id.trim()
      ? input.id.trim()
      : createTrustBarSlide({ image }).id;
  return {
    id,
    image,
    href: typeof input?.href === "string" ? input.href.trim() : "",
    alt: typeof input?.alt === "string" ? input.alt.trim() : "",
  };
}

export function normalizeTrustBarSettings(input?: Partial<TrustBarSettings> | null): TrustBarSettings {
  const stillSource = Array.isArray(input?.stills) ? input.stills : [];
  const stillA = normalizeTrustBarImage(stillSource[0]) ?? emptyTrustBarStill();
  const stillB = normalizeTrustBarImage(stillSource[1]) ?? emptyTrustBarStill();

  const carouselInput = input?.carousel;
  const slideSource = Array.isArray(carouselInput?.slides) ? carouselInput.slides : [];
  const slides = slideSource
    .map((slide) => normalizeTrustBarImage(slide, { requireImage: true }))
    .filter((slide): slide is TrustBarImage => Boolean(slide));

  return {
    stills: [stillA, stillB],
    stillHeight: clampInt(
      input?.stillHeight,
      TRUST_BAR_IMAGE_HEIGHT_DEFAULT,
      TRUST_BAR_IMAGE_HEIGHT_MIN,
      TRUST_BAR_IMAGE_HEIGHT_MAX,
    ),
    slideHeight: clampInt(
      input?.slideHeight,
      TRUST_BAR_IMAGE_HEIGHT_DEFAULT,
      TRUST_BAR_IMAGE_HEIGHT_MIN,
      TRUST_BAR_IMAGE_HEIGHT_MAX,
    ),
    carousel: {
      slides,
      autoplay: carouselInput?.autoplay !== false,
      autoplayMs: clampInt(
        carouselInput?.autoplayMs,
        TRUST_BAR_AUTOPLAY_MS,
        TRUST_BAR_AUTOPLAY_MIN,
        TRUST_BAR_AUTOPLAY_MAX,
      ),
      slidesToShowDesktop: clampInt(
        carouselInput?.slidesToShowDesktop,
        TRUST_BAR_SLIDES_DESKTOP_DEFAULT,
        TRUST_BAR_SLIDES_SHOW_MIN,
        TRUST_BAR_SLIDES_SHOW_MAX,
      ),
      slidesToShowMobile: clampInt(
        carouselInput?.slidesToShowMobile,
        TRUST_BAR_SLIDES_MOBILE_DEFAULT,
        TRUST_BAR_SLIDES_SHOW_MIN,
        TRUST_BAR_SLIDES_SHOW_MAX,
      ),
    },
  };
}

export const DEFAULT_TRUST_BAR_SETTINGS: TrustBarSettings = normalizeTrustBarSettings();

export function trustBarHasContent(settings: TrustBarSettings) {
  return settings.stills.some((item) => item.image) || settings.carousel.slides.length > 0;
}

/** Repeat slides until the marquee set can fill the viewport. */
export function trustBarMarqueeSet<T>(items: T[], visible: number) {
  if (items.length === 0) {
    return [];
  }
  const min = Math.max(items.length, visible, 1);
  const result: T[] = [];
  while (result.length < min) {
    result.push(...items);
  }
  return result;
}

/** Duration for one original slide set to pass, in ms. */
export function trustBarMarqueeDurationMs(slideCount: number, autoplayMs: number) {
  const count = Math.max(slideCount, 1);
  const perSlide = Math.max(1200, Math.round(autoplayMs / 3));
  return count * perSlide;
}
