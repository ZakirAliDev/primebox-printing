import { Footer } from "@/components/Footer";
import { GoogleFontStylesheet } from "@/components/GoogleFontStylesheet";
import { Header } from "@/components/Header";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { colorSchemeCssVars, linkTransitionCssVar } from "@/lib/color-scheme";
import { readCatalog } from "@/lib/catalog-store";
import { normalizeHeroSettings } from "@/lib/hero-slides";
import {
  collectSiteTypographyFamilies,
  normalizeSiteTypography,
  siteTypographyCssRules,
  siteTypographyCssVars,
} from "@/lib/site-typography";

/** Catalog comes from MySQL; never ship a build-time frozen storefront. */
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { siteSettings } = await readCatalog();
  const typography = normalizeSiteTypography(siteSettings.typography);
  const hero = normalizeHeroSettings(siteSettings.hero);
  const vars = {
    ...colorSchemeCssVars(siteSettings.colors),
    ...linkTransitionCssVar(siteSettings.linkTransitionMs),
    ...siteTypographyCssVars(typography),
  };
  const varCss = Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(";");
  const fontFamilies = [
    ...collectSiteTypographyFamilies(typography),
    hero.typography.heading.fontFamily,
    hero.typography.subheading.fontFamily,
    hero.typography.supporting.fontFamily,
    hero.typography.button.fontFamily,
  ];

  return (
    <div className="site-theme flex min-h-full flex-1 flex-col bg-background text-foreground">
      <style>{`.site-theme{${varCss}}${siteTypographyCssRules()}`}</style>
      <GoogleFontStylesheet families={fontFamilies} />
      <Header branding={siteSettings} />
      <main className="flex-1">{children}</main>
      <Footer branding={siteSettings} />
      <ScrollToTopButton />
    </div>
  );
}
