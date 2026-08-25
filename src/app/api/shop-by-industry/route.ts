import { NextResponse } from "next/server";
import { readCatalog } from "@/lib/catalog-store";
import { normalizeShopByIndustrySettings } from "@/lib/shop-by-industry";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Live Shop by industry payload — always MySQL, never CDN/prerender HTML. */
export async function GET() {
  const { categories, siteSettings } = await readCatalog();
  const shopByIndustry = normalizeShopByIndustrySettings(siteSettings.shopByIndustry);
  const industries = shopByIndustry.categorySlugs
    .map((slug) => categories.find((item) => item.slug === slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((industry) => ({
      slug: industry.slug,
      name: industry.name,
      description: industry.summary,
      supportingText: industry.cardSupportingText,
      image: industry.image,
    }));

  return NextResponse.json(
    {
      title: shopByIndustry.title,
      subtitle: shopByIndustry.subtitle,
      industries,
    },
    {
      headers: {
        "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
        "CDN-Cache-Control": "no-store",
        "Surrogate-Control": "no-store",
      },
    },
  );
}
