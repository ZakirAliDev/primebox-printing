import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { colorSchemeCssVars } from "@/lib/color-scheme";
import { readCatalog } from "@/lib/catalog-store";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { siteSettings } = await readCatalog();
  const vars = colorSchemeCssVars(siteSettings.colors);
  const css = Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(";");

  return (
    <div className="site-theme flex min-h-full flex-1 flex-col bg-background text-foreground">
      <style>{`.site-theme{${css}}`}</style>
      <Header branding={siteSettings} />
      <main className="flex-1">{children}</main>
      <Footer branding={siteSettings} />
      <ScrollToTopButton />
    </div>
  );
}
