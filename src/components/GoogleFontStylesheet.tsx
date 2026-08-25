import {
  collectGoogleFontsFromFamilies,
  googleFontsStylesheetUrl,
} from "@/lib/font-face";

/** Server-friendly font stylesheet link (also usable from client without the Google name catalog). */
export function GoogleFontStylesheet({ families }: { families: string[] }) {
  const href = googleFontsStylesheetUrl(collectGoogleFontsFromFamilies(families));
  if (!href) {
    return null;
  }
  return <link rel="stylesheet" href={href} />;
}
