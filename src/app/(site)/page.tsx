import nextDynamic from "next/dynamic";
import { CategoryCard } from "@/components/CategoryCard";
import {
  HomeBenefits,
  HomeProcess,
  HomeQuoteCta,
  HomeQuoteIntro,
  HomeStats,
  HomeSustainability,
  HomeTestimonials,
  HomeWhyChoose,
} from "@/components/HomeHardcodedSections";
import { HomeHero } from "@/components/HomeHero";
import { TrustBar } from "@/components/TrustBar";
import { packageCoverImage } from "@/lib/catalog";
import { readCatalog } from "@/lib/catalog-store";
import {
  FEATURED_CATEGORY_SUBTITLE,
  FEATURED_CATEGORY_TITLE,
  normalizeFeaturedCategorySettings,
} from "@/lib/featured-category";
import { plainTextFromHtml } from "@/lib/rich-text";
import { normalizeHomeTestimonialsSettings } from "@/lib/home-testimonials";
import { normalizeShopByIndustrySettings } from "@/lib/shop-by-industry";
import { normalizeTrustBarSettings } from "@/lib/trust-bar";

/** Always render on request so hard refresh matches client navigation (no stale ISR HTML). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const RelatedProductsCarousel = nextDynamic(
  () =>
    import("@/components/RelatedProductsCarousel").then((mod) => mod.RelatedProductsCarousel),
  { loading: () => <div className="mt-8 h-72 rounded-lg bg-navy/[0.03]" aria-hidden="true" /> },
);

const QuoteForm = nextDynamic(
  () => import("@/components/QuoteForm").then((mod) => mod.QuoteForm),
  { loading: () => <div className="mt-6 h-80 rounded-lg bg-white/60" aria-hidden="true" /> },
);

export default async function HomePage() {
  const { categories, packages, siteSettings } = await readCatalog();
  const shopByIndustry = normalizeShopByIndustrySettings(siteSettings.shopByIndustry);
  const trustBar = normalizeTrustBarSettings(siteSettings.trustBar);
  const featuredCategory = normalizeFeaturedCategorySettings(siteSettings.featuredCategory);
  const testimonials = normalizeHomeTestimonialsSettings(siteSettings.testimonials);
  const industries = shopByIndustry.categorySlugs
    .map((slug) => categories.find((item) => item.slug === slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const featuredProducts = featuredCategory.categorySlug
    ? packages
        .filter((item) => item.categorySlugs.includes(featuredCategory.categorySlug))
        .map((item) => ({
          slug: item.slug,
          name: item.name,
          summary: plainTextFromHtml(item.summary),
          image: packageCoverImage(item),
        }))
    : [];

  return (
    <>
      <HomeHero hero={siteSettings.hero} />

      <TrustBar settings={trustBar} />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl md:text-[2rem] md:leading-tight">
            Custom &amp; Graphic Packaging Solutions for Your Brand one
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

      <HomeProcess />
      <HomeStats />

      {featuredProducts.length > 0 ? (
        <section className="mx-auto max-w-6xl overflow-visible px-4 py-10 sm:py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl md:text-[2rem] md:leading-tight">
              {FEATURED_CATEGORY_TITLE}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-4 sm:text-base md:text-[1.05rem] md:leading-7">
              {FEATURED_CATEGORY_SUBTITLE}
            </p>
          </div>
          <RelatedProductsCarousel
            items={featuredProducts}
            slides={featuredCategory.slides}
            autoplay={featuredCategory.autoplay}
            autoplayMs={featuredCategory.autoplayMs}
            label="Featured packages"
          />
        </section>
      ) : null}

      <section className="bg-navy/5">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <HomeQuoteIntro />
          <QuoteForm compact hideTitle returnTo="/" />
        </div>
      </section>

      <HomeBenefits />
      <HomeSustainability />
      <HomeTestimonials settings={testimonials} />
      <HomeWhyChoose />
      <HomeQuoteCta />
    </>
  );
}
