export type ColorScheme = {
  primary: string;
  accent: string;
  onPrimary: string;
  onAccent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  headerBar: string;
  headerBarText: string;
  header: string;
  headerText: string;
  footer: string;
  footerText: string;
  footerMuted: string;
  footerLink: string;
  hero: string;
  heroText: string;
  button: string;
  buttonText: string;
  link: string;
  focus: string;
};

export const DEFAULT_COLOR_SCHEME: ColorScheme = {
  primary: "#12315a",
  accent: "#f5c518",
  onPrimary: "#ffffff",
  onAccent: "#12315a",
  background: "#ffffff",
  surface: "#ffffff",
  text: "#12315a",
  muted: "#5a7394",
  border: "#12315a",
  headerBar: "#12315a",
  headerBarText: "#ffffff",
  header: "#ffffff",
  headerText: "#12315a",
  footer: "#12315a",
  footerText: "#ffffff",
  footerMuted: "#c5d0dc",
  footerLink: "#f5c518",
  hero: "#12315a",
  heroText: "#ffffff",
  button: "#f5c518",
  buttonText: "#12315a",
  link: "#12315a",
  focus: "#12315a",
};

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function expandHex(value: string) {
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return value;
}

export function normalizeHexColor(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  if (!HEX.test(trimmed)) {
    return fallback;
  }
  return expandHex(trimmed).toLowerCase();
}

export function normalizeColorScheme(input?: Partial<ColorScheme> | null): ColorScheme {
  const next = { ...DEFAULT_COLOR_SCHEME };
  (Object.keys(DEFAULT_COLOR_SCHEME) as (keyof ColorScheme)[]).forEach((key) => {
    next[key] = normalizeHexColor(input?.[key], DEFAULT_COLOR_SCHEME[key]);
  });
  return next;
}

const PRIMARY_FOLLOWERS: (keyof ColorScheme)[] = [
  "text",
  "border",
  "headerBar",
  "headerText",
  "footer",
  "hero",
  "link",
  "focus",
];
const ACCENT_FOLLOWERS: (keyof ColorScheme)[] = ["footerLink", "button"];
const ON_PRIMARY_FOLLOWERS: (keyof ColorScheme)[] = ["headerBarText", "footerText", "heroText"];
const ON_ACCENT_FOLLOWERS: (keyof ColorScheme)[] = ["buttonText"];

function followersFor(key: keyof ColorScheme): (keyof ColorScheme)[] {
  if (key === "primary") {
    return PRIMARY_FOLLOWERS;
  }
  if (key === "accent") {
    return ACCENT_FOLLOWERS;
  }
  if (key === "onPrimary") {
    return ON_PRIMARY_FOLLOWERS;
  }
  if (key === "onAccent") {
    return ON_ACCENT_FOLLOWERS;
  }
  return [];
}

export function applyLinkedColor(scheme: ColorScheme, key: keyof ColorScheme, value: string): ColorScheme {
  const previous = scheme[key];
  const next = { ...scheme, [key]: value };
  for (const follower of followersFor(key)) {
    if (scheme[follower] === previous || scheme[follower] === DEFAULT_COLOR_SCHEME[follower]) {
      next[follower] = value;
    }
  }
  return next;
}

export function resolveColorScheme(scheme: ColorScheme): ColorScheme {
  const next = { ...scheme };
  for (const key of PRIMARY_FOLLOWERS) {
    if (scheme[key] === DEFAULT_COLOR_SCHEME[key]) {
      next[key] = scheme.primary;
    }
  }
  for (const key of ACCENT_FOLLOWERS) {
    if (scheme[key] === DEFAULT_COLOR_SCHEME[key]) {
      next[key] = scheme.accent;
    }
  }
  for (const key of ON_PRIMARY_FOLLOWERS) {
    if (scheme[key] === DEFAULT_COLOR_SCHEME[key]) {
      next[key] = scheme.onPrimary;
    }
  }
  for (const key of ON_ACCENT_FOLLOWERS) {
    if (scheme[key] === DEFAULT_COLOR_SCHEME[key]) {
      next[key] = scheme.onAccent;
    }
  }
  return next;
}

export function colorSchemeCssVars(scheme: ColorScheme): Record<string, string> {
  const resolved = resolveColorScheme(scheme);
  return {
    "--scheme-primary": resolved.primary,
    "--scheme-accent": resolved.accent,
    "--scheme-on-primary": resolved.onPrimary,
    "--scheme-on-accent": resolved.onAccent,
    "--scheme-background": resolved.background,
    "--scheme-surface": resolved.surface,
    "--scheme-text": resolved.text,
    "--scheme-muted": resolved.muted,
    "--scheme-border": resolved.border,
    "--scheme-header-bar": resolved.headerBar,
    "--scheme-header-bar-text": resolved.headerBarText,
    "--scheme-header": resolved.header,
    "--scheme-header-text": resolved.headerText,
    "--scheme-footer": resolved.footer,
    "--scheme-footer-text": resolved.footerText,
    "--scheme-footer-muted": resolved.footerMuted,
    "--scheme-footer-link": resolved.footerLink,
    "--scheme-hero": resolved.hero,
    "--scheme-hero-text": resolved.heroText,
    "--scheme-button": resolved.button,
    "--scheme-button-text": resolved.buttonText,
    "--scheme-link": resolved.link,
    "--scheme-focus": resolved.focus,
  };
}
