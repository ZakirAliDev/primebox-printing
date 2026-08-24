import { CategoryCard } from "@/components/CategoryCard";
import { HomeHero } from "@/components/HomeHero";
import { QuoteForm } from "@/components/QuoteForm";
import { TrustBar } from "@/components/TrustBar";
import { readCatalog } from "@/lib/catalog-store";
import { normalizeShopByIndustrySettings } from "@/lib/shop-by-industry";
import { normalizeTrustBarSettings } from "@/lib/trust-bar";

export default async function HomePage() {
  const { categories, siteSettings } = await readCatalog();
  const shopByIndustry = normalizeShopByIndustrySettings(siteSettings.shopByIndustry);
  const trustBar = normalizeTrustBarSettings(siteSettings.trustBar);
  const industries = shopByIndustry.categorySlugs
    .map((slug) => categories.find((item) => item.slug === slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <>
      <HomeHero hero={siteSettings.hero} />

      <TrustBar settings={trustBar} />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl md:text-[2rem] md:leading-tight">
            Custom &amp; Graphic Packaging Solutions for Your Brand
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-4 sm:text-base md:text-[1.05rem] md:leading-7">
            Prime Box Printing offer top-quality custom packaging and graphic packaging
            solutions designed to elevate your brand. Our expert team specializes in
            creating unique, eye catching custom packaging boxes and product packaging
            designs that protect your products while leaving a lasting impression. If you
            need retail packaging, branded boxes or specialized industrial packaging
            designs. We manage each project to your specific needs.
          </p>
        </div>
      </section>

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
