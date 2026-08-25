/** Lightweight font helpers safe for client bundles (no Google font name catalog). */

export const SITE_FONT_OPTIONS = [
  { id: "", label: "Default", css: "inherit" },
  { id: "sans", label: "Site sans", css: "var(--font-sans), Helvetica, Arial, sans-serif" },
  { id: "serif", label: "Serif", css: "Georgia, 'Times New Roman', serif" },
  { id: "mono", label: "Mono", css: "ui-monospace, monospace" },
] as const;

const SITE_FONT_CSS = new Map<string, string>(SITE_FONT_OPTIONS.map((option) => [option.id, option.css]));
const SITE_FONT_IDS = new Set<string>(SITE_FONT_OPTIONS.map((option) => option.id));
const DEFAULT_GOOGLE_WEIGHTS = ["400", "700", "900"];

export function isSiteFont(family: string): boolean {
  return SITE_FONT_IDS.has(family);
}

export function sanitizeFontFamily(value: string): string {
  return value
    .replace(/["'`\\;{}<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function fontFamilyCss(family: string): string {
  const siteFontCss = SITE_FONT_CSS.get(family);
  if (siteFontCss !== undefined) {
    return siteFontCss;
  }
  const name = sanitizeFontFamily(family);
  return name ? `"${name}", sans-serif` : "inherit";
}

export function fontOptionLabel(family: string): string {
  return SITE_FONT_OPTIONS.find((option) => option.id === family)?.label ?? family;
}

/** Families that should be requested from Google Fonts (anything non-empty that isn't a site stack). */
export function collectGoogleFontsFromFamilies(
  families: string[],
  weights: string[] = DEFAULT_GOOGLE_WEIGHTS,
): { family: string; weights: string[] }[] {
  const seen = new Set<string>();
  const fonts: { family: string; weights: string[] }[] = [];
  for (const raw of families) {
    const family = sanitizeFontFamily(typeof raw === "string" ? raw : "");
    if (!family || isSiteFont(family) || seen.has(family)) {
      continue;
    }
    seen.add(family);
    fonts.push({ family, weights: [...weights] });
  }
  return fonts;
}

export function googleFontsStylesheetUrl(
  fonts: { family: string; weights: string[] }[],
): string | null {
  if (fonts.length === 0) {
    return null;
  }
  const query = fonts
    .map((font) => {
      const family = font.family.replace(/ /g, "+");
      const weights = [...new Set(font.weights)].sort().join(";");
      return `family=${family}:wght@${weights}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

export function googleFontsHrefFromFamilies(families: string[]): string | null {
  return googleFontsStylesheetUrl(collectGoogleFontsFromFamilies(families));
}

type AppearanceTypography = {
  fontFamily?: string;
  fontWeight?: string;
} | null | undefined;

type AppearanceMap = Record<string, { typography?: AppearanceTypography } | null | undefined>;

type FontWidget = {
  appearance: AppearanceMap;
  type?: string;
  cells?: { widgets: FontWidget[] }[];
};

type FontSection = {
  columns: { widgets: FontWidget[] }[];
};

function collectAppearanceFonts(
  appearance: AppearanceMap,
  collectedFonts: Map<string, Set<string>>,
): void {
  for (const snapshot of Object.values(appearance)) {
    const family = snapshot?.typography?.fontFamily;
    if (!family) {
      continue;
    }
    const name = sanitizeFontFamily(family);
    if (!name || isSiteFont(name)) {
      continue;
    }
    const nextWeights = collectedFonts.get(name) ?? new Set<string>(["400", "700"]);
    if (snapshot?.typography?.fontWeight) {
      nextWeights.add(snapshot.typography.fontWeight);
    }
    collectedFonts.set(name, nextWeights);
  }
}

function collectWidgetFonts(widget: FontWidget, collectedFonts: Map<string, Set<string>>): void {
  collectAppearanceFonts(widget.appearance, collectedFonts);
  if (widget.type === "grid" && widget.cells) {
    for (const cell of widget.cells) {
      for (const childWidget of cell.widgets) {
        collectWidgetFonts(childWidget, collectedFonts);
      }
    }
  }
}

/** Collect Google-loadable families from a template layout without the Google name catalog. */
export function collectGoogleFontsFromLayout(
  layout: FontSection[],
): { family: string; weights: string[] }[] {
  const collectedFonts = new Map<string, Set<string>>();
  for (const section of layout) {
    for (const column of section.columns) {
      for (const widget of column.widgets) {
        collectWidgetFonts(widget, collectedFonts);
      }
    }
  }
  return Array.from(collectedFonts, ([family, weights]) => ({
    family,
    weights: [...weights].sort(),
  }));
}
