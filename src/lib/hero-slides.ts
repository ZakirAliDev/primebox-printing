import { normalizeHexColor } from "./color-scheme.ts";
import { isGoogleFont, isSiteFont, sanitizeFontFamily } from "./google-fonts.ts";

export type HeroSlide = {
  id: string;
  heading: string;
  lines: [string, string];
  image: string;
  alt: string;
  buttonLabel: string;
  buttonHref: string;
};

export type HeroTextStyle = {
  fontFamily: string;
  fontSize: number;
};

export type HeroTypography = {
  heading: HeroTextStyle;
  subheading: HeroTextStyle;
  supporting: HeroTextStyle;
  button: HeroTextStyle;
};

export type HeroSettings = {
  autoplay: boolean;
  autoplayMs: number;
  transitionMs: number;
  pauseOnHover: boolean;
  showArrows: boolean;
  arrowsOnHover: boolean;
  animateHeading: boolean;
  height: number;
  paddingTop: number;
  paddingBottom: number;
  background: string;
  backgroundImage: string;
  typography: HeroTypography;
  customFonts: string[];
  slides: HeroSlide[];
};

export const HERO_SLIDE_MS = 500;
export const HERO_AUTOPLAY_MS = 5000;
export const HERO_AUTOPLAY_MIN = 1000;
export const HERO_AUTOPLAY_MAX = 20000;
export const HERO_TRANSITION_MIN = 100;
export const HERO_TRANSITION_MAX = 2000;
export const HERO_FONT_SIZE_MIN = 10;
export const HERO_FONT_SIZE_MAX = 96;
export const DEFAULT_HERO_BUTTON_LABEL = "Get Instant Quote";
export const DEFAULT_HERO_BUTTON_HREF = "/quote";
export const DEFAULT_HERO_BACKGROUND = "#ffffff";
export const DEFAULT_HERO_HEIGHT = 430;
export const HERO_HEIGHT_MIN = 200;
export const HERO_HEIGHT_MAX = 900;
export const DEFAULT_HERO_PADDING_Y = 40;
export const HERO_PADDING_MIN = 0;
export const HERO_PADDING_MAX = 200;

export const DEFAULT_HERO_TYPOGRAPHY: HeroTypography = {
  heading: { fontFamily: "sans", fontSize: 55 },
  subheading: { fontFamily: "sans", fontSize: 26 },
  supporting: { fontFamily: "sans", fontSize: 18 },
  button: { fontFamily: "sans", fontSize: 17 },
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "christmas",
    heading: "Get 75% off on Christmas",
    lines: ["Design Your Exceptional Packaging in Any Shape & Style", "Starting From 100 Boxes"],
    image: "/hero/christmas.webp",
    alt: "Holiday custom packaging boxes",
    buttonLabel: DEFAULT_HERO_BUTTON_LABEL,
    buttonHref: DEFAULT_HERO_BUTTON_HREF,
  },
  {
    id: "mylar",
    heading: "Custom Printed Mylar Bags & Stand Up Pouches",
    lines: ["Design Your Exceptional Zipper Bags Packaging", "Click Below to Get An Estimate!"],
    image: "/hero/mylar.webp",
    alt: "Custom printed Mylar bags and stand up pouches",
    buttonLabel: DEFAULT_HERO_BUTTON_LABEL,
    buttonHref: DEFAULT_HERO_BUTTON_HREF,
  },
  {
    id: "boxes",
    heading: "Custom Boxes With Your Branding",
    lines: ["Design Your Exceptional Packaging in Any Shape & Style", "Starting From 100 Boxes"],
    image: "/hero/boxes.webp",
    alt: "Custom branded packaging boxes",
    buttonLabel: DEFAULT_HERO_BUTTON_LABEL,
    buttonHref: DEFAULT_HERO_BUTTON_HREF,
  },
];

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  autoplay: true,
  autoplayMs: HERO_AUTOPLAY_MS,
  transitionMs: HERO_SLIDE_MS,
  pauseOnHover: true,
  showArrows: true,
  arrowsOnHover: false,
  animateHeading: true,
  height: DEFAULT_HERO_HEIGHT,
  paddingTop: DEFAULT_HERO_PADDING_Y,
  paddingBottom: DEFAULT_HERO_PADDING_Y,
  background: DEFAULT_HERO_BACKGROUND,
  backgroundImage: "",
  typography: DEFAULT_HERO_TYPOGRAPHY,
  customFonts: [],
  slides: HERO_SLIDES,
};

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeFontFamily(value: unknown, fallback = "sans") {
  if (typeof value !== "string") {
    return fallback;
  }
  if (isSiteFont(value)) {
    return value;
  }
  return sanitizeFontFamily(value) || fallback;
}

function normalizeCustomFonts(input: unknown, usedFamilies: string[]): string[] {
  const raw = Array.isArray(input) ? input : [];
  const names = [...raw, ...usedFamilies].map((item) => (typeof item === "string" ? sanitizeFontFamily(item) : ""));
  const seen = new Set<string>();
  const fonts: string[] = [];
  for (const name of names) {
    if (!name || isSiteFont(name) || isGoogleFont(name)) {
      continue;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    fonts.push(name);
  }
  return fonts;
}

function normalizeTextStyle(input: unknown, fallback: HeroTextStyle): HeroTextStyle {
  const item = input && typeof input === "object" ? (input as Partial<HeroTextStyle>) : {};
  return {
    fontFamily: normalizeFontFamily(item.fontFamily ?? fallback.fontFamily),
    fontSize: clampInt(item.fontSize, fallback.fontSize, HERO_FONT_SIZE_MIN, HERO_FONT_SIZE_MAX),
  };
}

function normalizeTypography(input?: Partial<HeroTypography> | null): HeroTypography {
  return {
    heading: normalizeTextStyle(input?.heading, DEFAULT_HERO_TYPOGRAPHY.heading),
    subheading: normalizeTextStyle(input?.subheading, DEFAULT_HERO_TYPOGRAPHY.subheading),
    supporting: normalizeTextStyle(input?.supporting, DEFAULT_HERO_TYPOGRAPHY.supporting),
    button: normalizeTextStyle(input?.button, DEFAULT_HERO_TYPOGRAPHY.button),
  };
}

export function createHeroSlide(): HeroSlide {
  return {
    id: `slide-${Date.now().toString(36)}`,
    heading: "",
    lines: ["", ""],
    image: "",
    alt: "",
    buttonLabel: DEFAULT_HERO_BUTTON_LABEL,
    buttonHref: DEFAULT_HERO_BUTTON_HREF,
  };
}

export function normalizeHeroSlide(input: unknown, index: number): HeroSlide {
  const item = input && typeof input === "object" ? (input as Partial<HeroSlide> & { lines?: unknown }) : {};
  const lines = Array.isArray(item.lines) ? item.lines : [];
  return {
    id: asString(item.id) || `slide-${index + 1}`,
    heading: asString(item.heading),
    lines: [asString(lines[0]), asString(lines[1])],
    image: asString(item.image),
    alt: asString(item.alt),
    buttonLabel: asString(item.buttonLabel) || DEFAULT_HERO_BUTTON_LABEL,
    buttonHref: asString(item.buttonHref) || DEFAULT_HERO_BUTTON_HREF,
  };
}

export function normalizeHeroSettings(input?: Partial<HeroSettings> | null): HeroSettings {
  const slides = Array.isArray(input?.slides)
    ? input.slides.map((slide, index) => normalizeHeroSlide(slide, index))
    : HERO_SLIDES.map((slide) => ({ ...slide, lines: [...slide.lines] as [string, string] }));
  return {
    autoplay: input?.autoplay !== false,
    autoplayMs: clampInt(input?.autoplayMs, HERO_AUTOPLAY_MS, HERO_AUTOPLAY_MIN, HERO_AUTOPLAY_MAX),
    transitionMs: clampInt(input?.transitionMs, HERO_SLIDE_MS, HERO_TRANSITION_MIN, HERO_TRANSITION_MAX),
    pauseOnHover: input?.pauseOnHover !== false,
    showArrows: input?.showArrows !== false,
    arrowsOnHover: input?.arrowsOnHover === true,
    animateHeading: input?.animateHeading !== false,
    height: clampInt(input?.height, DEFAULT_HERO_HEIGHT, HERO_HEIGHT_MIN, HERO_HEIGHT_MAX),
    paddingTop: clampInt(input?.paddingTop, DEFAULT_HERO_PADDING_Y, HERO_PADDING_MIN, HERO_PADDING_MAX),
    paddingBottom: clampInt(input?.paddingBottom, DEFAULT_HERO_PADDING_Y, HERO_PADDING_MIN, HERO_PADDING_MAX),
    background: normalizeHexColor(input?.background, DEFAULT_HERO_BACKGROUND),
    backgroundImage: asString(input?.backgroundImage),
    typography: normalizeTypography(input?.typography),
    customFonts: normalizeCustomFonts(input?.customFonts, [
      input?.typography?.heading?.fontFamily ?? "",
      input?.typography?.subheading?.fontFamily ?? "",
      input?.typography?.supporting?.fontFamily ?? "",
      input?.typography?.button?.fontFamily ?? "",
    ]),
    slides,
  };
}

export function heroLoopSlides(slides: HeroSlide[]) {
  if (slides.length === 0) {
    return [];
  }
  return [slides[slides.length - 1], ...slides, slides[0]];
}

export function heroRealIndex(loopIndex: number, length: number) {
  if (length === 0) {
    return 0;
  }
  if (loopIndex === 0) {
    return length - 1;
  }
  if (loopIndex === length + 1) {
    return 0;
  }
  return loopIndex - 1;
}

export function heroSnapIndex(loopIndex: number, length: number) {
  if (loopIndex === 0) {
    return length;
  }
  if (loopIndex === length + 1) {
    return 1;
  }
  return loopIndex;
}
