import { CategoryCard } from "@/components/CategoryCard";
import { HomeHero } from "@/components/HomeHero";
import { QuoteForm } from "@/components/QuoteForm";
import { readCatalog } from "@/lib/catalog-store";
import { normalizeShopByIndustrySettings } from "@/lib/shop-by-industry";

export default async function HomePage() {
  const { categories, siteSettings } = await readCatalog();
  const shopByIndustry = normalizeShopByIndustrySettings(siteSettings.shopByIndustry);
  const industries = shopByIndustry.categorySlugs
    .map((slug) => categories.find((item) => item.slug === slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <>
      <HomeHero hero={siteSettings.hero} />

      {industries.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold">{shopByIndustry.title}</h2>
          {shopByIndustry.subtitle ? (
            <p className="mt-2 max-w-2xl text-muted">{shopByIndustry.subtitle}</p>
          ) : null}
          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {industries.map((industry) => (
              <li key={industry.slug}>
                <CategoryCard
                  item={{
                    slug: industry.slug,
                    name: industry.name,
                    description: industry.summary,
                    supportingText: industry.cardSupportingText,
                    image: industry.image,
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="bg-navy/5">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <QuoteForm compact />
        </div>
      </section>
    </>
  );
}
