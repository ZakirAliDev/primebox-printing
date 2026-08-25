import { GOOGLE_FONT_FAMILIES } from "../data/google-font-families.ts";
import {
  SITE_FONT_OPTIONS,
  collectGoogleFontsFromLayout,
  fontFamilyCss,
  fontOptionLabel,
  isSiteFont,
  sanitizeFontFamily,
  googleFontsStylesheetUrl,
  collectGoogleFontsFromFamilies as collectLoadableFamilies,
} from "./font-face";
import type { TemplateSection } from "./template-layout";

export {
  SITE_FONT_OPTIONS,
  fontFamilyCss,
  fontOptionLabel,
  isSiteFont,
  sanitizeFontFamily,
  googleFontsStylesheetUrl,
} from "./font-face";

export const GOOGLE_FONT_NAMES = GOOGLE_FONT_FAMILIES;

export type FontOptionGroup = "site" | "custom" | "google";

export type FontOption = {
  id: string;
  label: string;
  group: FontOptionGroup;
};

const GOOGLE_FONT_NAME_SET = new Set<string>(GOOGLE_FONT_NAMES);

export function isGoogleFont(family: string): boolean {
  return GOOGLE_FONT_NAME_SET.has(family);
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
  weights?: string[],
): { family: string; weights: string[] }[] {
  const known = families.filter((family) => isGoogleFont(family));
  return collectLoadableFamilies(known.length > 0 ? known : families, weights);
}

export function collectGoogleFonts(
  layout: TemplateSection[],
): { family: string; weights: string[] }[] {
  return collectGoogleFontsFromLayout(layout);
}
