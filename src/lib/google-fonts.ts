import { GOOGLE_FONT_FAMILIES } from "../data/google-font-families.ts";
import type { TemplateSection, TemplateWidget, WidgetAppearanceMap } from "./template-layout";

export const SITE_FONT_OPTIONS = [
  { id: "", label: "Default", css: "inherit" },
  { id: "sans", label: "Site sans", css: "var(--font-sans), Helvetica, Arial, sans-serif" },
  { id: "serif", label: "Serif", css: "Georgia, 'Times New Roman', serif" },
  { id: "mono", label: "Mono", css: "ui-monospace, monospace" },
] as const;

export const GOOGLE_FONT_NAMES = GOOGLE_FONT_FAMILIES;

export type FontOptionGroup = "site" | "custom" | "google";

export type FontOption = {
  id: string;
  label: string;
  group: FontOptionGroup;
};

const GOOGLE_FONT_NAME_SET = new Set<string>(GOOGLE_FONT_NAMES);
const SITE_FONT_CSS = new Map<string, string>(SITE_FONT_OPTIONS.map((option) => [option.id, option.css]));
const SITE_FONT_IDS = new Set<string>(SITE_FONT_OPTIONS.map((option) => option.id));
const DEFAULT_GOOGLE_WEIGHTS = ["400", "700", "900"];

export function isSiteFont(family: string): boolean {
  return SITE_FONT_IDS.has(family);
}

export function isGoogleFont(family: string): boolean {
  return GOOGLE_FONT_NAME_SET.has(family);
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

export function filterFontOptions(query: string, extras: string[] = [], limit = 50): FontOption[] {
  const needle = query.trim().toLowerCase();
  const matches = (label: string, id: string) =>
    !needle || label.toLowerCase().includes(needle) || id.toLowerCase().includes(needle);

  const site = SITE_FONT_OPTIONS.filter((option) => matches(option.label, option.id)).map((option) => ({
    id: option.id,
    label: option.label,
    group: "site" as const,
  }));

  const seen = new Set<string>();
  const custom: FontOption[] = [];
  for (const extra of extras) {
    const name = sanitizeFontFamily(extra);
    if (!name || isSiteFont(name) || isGoogleFont(name)) {
      continue;
    }
    const key = name.toLowerCase();
    if (seen.has(key) || !matches(name, name)) {
      continue;
    }
    seen.add(key);
    custom.push({ id: name, label: name, group: "custom" });
  }

  const google: FontOption[] = [];
  for (const name of GOOGLE_FONT_NAMES) {
    if (google.length >= limit) {
      break;
    }
    if (!matches(name, name)) {
      continue;
    }
    google.push({ id: name, label: name, group: "google" });
  }

  return [...site, ...custom, ...google];
}

export function canAddCustomFont(query: string, extras: string[] = []): boolean {
  const name = sanitizeFontFamily(query);
  if (!name || isSiteFont(name) || isGoogleFont(name)) {
    return false;
  }
  return !extras.some((extra) => sanitizeFontFamily(extra).toLowerCase() === name.toLowerCase());
}

export function collectGoogleFontsFromFamilies(
  families: string[],
  weights: string[] = DEFAULT_GOOGLE_WEIGHTS,
): { family: string; weights: string[] }[] {
  const seen = new Set<string>();
  const fonts: { family: string; weights: string[] }[] = [];
  for (const family of families) {
    if (!isGoogleFont(family) || seen.has(family)) {
      continue;
    }
    seen.add(family);
    fonts.push({ family, weights: [...weights] });
  }
  return fonts;
}

function collectAppearanceFonts(
  appearance: WidgetAppearanceMap,
  collectedFonts: Map<string, Set<string>>,
): void {
  for (const snapshot of Object.values(appearance)) {
    const family = snapshot?.typography.fontFamily;
    if (!family || !isGoogleFont(family)) {
      continue;
    }
    const nextWeights = collectedFonts.get(family) ?? new Set<string>(["400", "700"]);
    if (snapshot.typography.fontWeight) {
      nextWeights.add(snapshot.typography.fontWeight);
    }
    collectedFonts.set(family, nextWeights);
  }
}

function collectWidgetFonts(
  widget: TemplateWidget,
  collectedFonts: Map<string, Set<string>>,
): void {
  collectAppearanceFonts(widget.appearance, collectedFonts);
  if (widget.type === "grid") {
    for (const cell of widget.cells) {
      for (const childWidget of cell.widgets) {
        collectWidgetFonts(childWidget, collectedFonts);
      }
    }
  }
}

export function collectGoogleFonts(
  layout: TemplateSection[],
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

export function fontOptionLabel(family: string): string {
  return SITE_FONT_OPTIONS.find((option) => option.id === family)?.label ?? family;
}
