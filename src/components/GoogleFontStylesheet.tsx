"use client";

import { collectGoogleFontsFromFamilies, googleFontsStylesheetUrl } from "@/lib/google-fonts";

export function GoogleFontStylesheet({ families }: { families: string[] }) {
  const href = googleFontsStylesheetUrl(collectGoogleFontsFromFamilies(families));
  if (!href) {
    return null;
  }
  return <link rel="stylesheet" href={href} />;
}
