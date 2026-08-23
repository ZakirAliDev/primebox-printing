import { notFound } from "next/navigation";
import { Accordion } from "@/components/Accordion";
import { ContactForm } from "@/components/ContactForm";
import { ProductDataTabs } from "@/components/ProductDataTabs";
import { ProductFormTabs } from "@/components/ProductFormTabs";
import { ProductGallery } from "@/components/ProductGallery";
import { RelatedProductsCarousel } from "@/components/RelatedProductsCarousel";
import { QuoteForm } from "@/components/QuoteForm";
import { RichText } from "@/components/RichText";
import { ShowMoreContent } from "@/components/ShowMoreContent";
import { packageCoverImage, relatedPackages, resolveProductExtraContent, resolveProductFaqs, resolveProductTabs } from "@/lib/catalog";
import { readCatalog } from "@/lib/catalog-store";
import { plainTextFromHtml } from "@/lib/rich-text";

type PackagePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
};

export async function generateStaticParams() {
  const { packages } = await readCatalog();
  return packages.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PackagePageProps) {
  const { slug } = await params;
  const { packages } = await readCatalog();
  const item = packages.find((entry) => entry.slug === slug);
  return {
    title: item ? item.name : "Package",
    description: item ? plainTextFromHtml(item.summary) : undefined,
  };
}

export default async function PackagePage({ params, searchParams }: PackagePageProps) {
  const { slug } = await params;
  const flags = await searchParams;
  const { packages, tabTemplates, productPageSettings } = await readCatalog();
  const item = packages.find((entry) => entry.slug === slug);
  if (!item) {
    notFound();
  }

  const related = relatedPackages(item, packages);
  const returnTo = `/packages/${item.slug}`;
  const tabs = resolveProductTabs(item, productPageSettings);
  const faqs = resolveProductFaqs(item, productPageSettings);
  const extraContent = resolveProductExtraContent(item, productPageSettings);

  return (
    <article className="mx-auto max-w-6xl px-4 py-12">
      {flags.sent ? (
        <p className="mb-6 rounded border border-green-200 bg-green-50 p-3 text-sm">
          Request received. We will contact you shortly.
        </p>
      ) : null}
      {flags.error ? (
        <p className="mb-6 rounded border border-red-200 bg-red-50 p-3 text-sm">
          Please complete the required fields.
        </p>
      ) : null}

      <section className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="min-w-0 self-start lg:sticky lg:top-8">
          <ProductGallery image={item.image} gallery={item.gallery} name={item.name} />
        </div>

        <div className="min-w-0">
          <h1 className="text-4xl font-semibold">{item.name}</h1>
          <RichText html={item.summary} className="mt-4 text-navy/70" />

          <div className="mt-8">
            <ProductFormTabs
              quote={<QuoteForm embedded returnTo={returnTo} />}
              contact={<ContactForm embedded returnTo={returnTo} />}
            />
          </div>
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <ProductDataTabs description={item.body} tabs={tabs} templates={tabTemplates} />
        {plainTextFromHtml(extraContent) ? (
          <ShowMoreContent
            html={extraContent}
            align={productPageSettings.extraContentAlign}
            animationMs={productPageSettings.extraContentAnimationMs}
            collapsedHeight={productPageSettings.extraContentCollapsedHeight}
          />
        ) : null}
        {faqs.length > 0 ? (
          <Accordion
            defaultOpen
            title="FAQs"
            className="rounded-lg border border-border/10"
            titleClassName="bg-button px-4 py-3 font-semibold text-button-text"
          >
            <div className="space-y-2 p-3">
              {faqs.map((faq, index) => (
                <Accordion
                  key={`${faq.question}-${index}`}
                  title={faq.question}
                  className="rounded-lg border border-border/10"
                >
                  <p className="whitespace-pre-wrap px-4 py-5 text-sm text-navy/80">{faq.answer}</p>
                </Accordion>
              ))}
            </div>
          </Accordion>
        ) : null}
      </section>

      {related.length > 0 ? (
        <section className="relative mt-12 overflow-visible">
          <h2 className="text-2xl font-semibold">Related packages</h2>
          <RelatedProductsCarousel
            items={related.map((relatedItem) => ({
              slug: relatedItem.slug,
              name: relatedItem.name,
              summary: plainTextFromHtml(relatedItem.summary),
              image: packageCoverImage(relatedItem),
            }))}
            slides={productPageSettings.relatedCarouselSlides}
            autoplay={productPageSettings.relatedCarouselAutoplay}
            autoplayMs={productPageSettings.relatedCarouselAutoplayMs}
          />
        </section>
      ) : null}
    </article>
  );
}
