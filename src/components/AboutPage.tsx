import Link from "next/link";
import { ExclusiveAccordion } from "@/components/Accordion";
import { HomeQuoteCta, HomeQuoteIntro } from "@/components/HomeHardcodedSections";
import { QuoteForm } from "@/components/QuoteForm";
import {
  ABOUT_BRANDS,
  ABOUT_CONTACT,
  ABOUT_CUSTOMERS,
  ABOUT_FAQS,
  ABOUT_INTRO,
  ABOUT_JOIN,
  ABOUT_MISSION,
  ABOUT_OFFER,
  ABOUT_PARTNERS,
  ABOUT_PLATFORM,
  ABOUT_STORIES,
  ABOUT_VALUES,
  ABOUT_VALUES_INTRO,
  ABOUT_WHO,
  ABOUT_WHY,
} from "@/data/about-page";

const heading =
  "text-2xl font-semibold tracking-tight text-navy sm:text-3xl md:text-[2rem] md:leading-tight";
const body = "text-sm leading-relaxed text-muted sm:text-base md:text-[1.05rem] md:leading-7";

function GoldRule({ className = "" }: { className?: string }) {
  return <span className={`about-rule mt-4 block h-1 w-16 bg-button ${className}`} aria-hidden="true" />;
}

export function AboutPage({ sent, error }: { sent?: boolean; error?: boolean }) {
  return (
    <>
      <section className="about-grain bg-navy text-white [&_a]:text-white [&_h1]:text-white [&_p]:text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12 md:py-16">
          <p className="text-sm text-white/70">
            <Link href="/" className="text-white/70 hover:text-button">
              Home
            </Link>
            <span className="mx-2 text-button">/</span>
            <span className="text-white">About Us</span>
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">About Us</h1>
          <GoldRule />
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">About Prime Box Printing</h2>
            <p className="mt-5 text-base leading-relaxed text-white/85 md:text-[1.05rem] md:leading-7">{ABOUT_INTRO}</p>
            <Link
              href="/quote"
              className="mt-8 inline-flex rounded bg-button px-6 py-2.5 text-sm font-semibold text-button-text hover:bg-button/90"
            >
              Get Free Quote
            </Link>
          </div>
          <div className="about-media overflow-hidden border-4 border-button/80">
            <img
              src="/about/hero.jpg"
              alt="Custom printed cosmetic and gift boxes from Prime Box Printing"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={heading}>{ABOUT_PLATFORM.title}</h2>
          <GoldRule className="mx-auto" />
          {ABOUT_PLATFORM.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className={`mt-5 ${body}`}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="bg-navy/[0.04]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-2 md:py-20">
          {[ABOUT_CUSTOMERS, ABOUT_PARTNERS].map((group) => (
            <div key={group.title}>
              <div className="about-media mb-6 overflow-hidden bg-white">
                <img src={group.image} alt="" className="mx-auto h-48 w-auto object-contain p-4" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-navy">{group.title}</h2>
              <GoldRule />
              <ul className="mt-8 space-y-6">
                {group.points.map((point) => (
                  <li key={point.title}>
                    <h3 className="flex items-start gap-3 text-base font-semibold text-navy">
                      <span className="mt-1.5 h-2 w-2 shrink-0 bg-button" aria-hidden="true" />
                      {point.title}
                    </h3>
                    <p className="mt-2 pl-5 text-sm leading-relaxed text-muted">{point.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <h2 className={`${heading} text-center`}>Our Mission</h2>
        <GoldRule className="mx-auto" />
        <ol className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-7 right-[8%] left-[8%] hidden h-[3px] bg-gradient-to-r from-navy via-button to-navy lg:block"
          />
          {ABOUT_MISSION.map((step) => (
            <li key={step.n} className="about-step text-center">
              <span className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-button bg-white text-sm font-semibold text-navy">
                {step.n}
              </span>
              <h3 className="mt-4 text-base font-semibold text-navy">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-[2rem]">{ABOUT_BRANDS.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">{ABOUT_BRANDS.body}</p>
            <Link href={ABOUT_BRANDS.href} className="mt-6 inline-flex font-semibold text-button hover:underline">
              {ABOUT_BRANDS.cta}
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
            {ABOUT_BRANDS.images.map((src, index) => (
              <li key={src} className="about-media overflow-hidden bg-white">
                <img src={src} alt={`Custom packaging example ${index + 1}`} className="aspect-square w-full object-cover" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div className="about-media overflow-hidden">
          <img src={ABOUT_WHO.image} alt="Prime Box Printing packaging production" className="w-full object-cover" />
        </div>
        <div>
          <h2 className={heading}>{ABOUT_WHO.title}</h2>
          <GoldRule />
          {ABOUT_WHO.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className={`mt-5 ${body}`}>
              {paragraph}
            </p>
          ))}
          <dl className="mt-8 grid grid-cols-2 gap-6">
            {ABOUT_WHO.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-3xl font-semibold text-navy">{stat.value}</dt>
                <dd className="mt-1 text-sm text-muted">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-navy/[0.04]">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <h2 className={heading}>{ABOUT_OFFER.title}</h2>
            <GoldRule />
            <p className={`mt-5 ${body}`}>{ABOUT_OFFER.intro}</p>
            <ul className="mt-6 space-y-4">
              {ABOUT_OFFER.items.map((item) => (
                <li key={item.title} className="border-l-[3px] border-button pl-4">
                  <h3 className="font-semibold text-navy">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
                </li>
              ))}
            </ul>
            <p className={`mt-6 ${body}`}>{ABOUT_OFFER.footer}</p>
          </div>
          <div className="about-media overflow-hidden">
            <img src={ABOUT_OFFER.image} alt="Custom packaging styles we produce" className="w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-button">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center md:py-16">
          <h2 className="text-2xl font-semibold text-navy sm:text-3xl">{ABOUT_CONTACT.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-navy/80 sm:text-base">{ABOUT_CONTACT.body}</p>
        </div>
      </section>

      <section className="bg-navy/5">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <HomeQuoteIntro />
          {sent ? (
            <p className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm">
              Quote request received. We will contact you shortly.
            </p>
          ) : null}
          {error ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm">
              Please fill in name, email, and comment.
            </p>
          ) : null}
          <QuoteForm compact hideTitle returnTo="/about-us" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={heading}>Our Values</h2>
          <GoldRule className="mx-auto" />
          <p className={`mt-5 ${body}`}>{ABOUT_VALUES_INTRO}</p>
        </div>
        <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {ABOUT_VALUES.map((value, index) => (
            <li key={value.title} className="border-t-2 border-button pt-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-button">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-lg font-semibold text-navy">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{value.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {ABOUT_STORIES.map((story, index) => (
        <section
          key={story.title}
          className={index % 2 === 1 ? "bg-navy/[0.04]" : ""}
        >
          <div
            className={`mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20 ${
              index % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
            }`}
          >
            <div className="about-media overflow-hidden">
              <img src={story.image} alt="" className="w-full object-cover" />
            </div>
            <div>
              <h2 className={heading}>{story.title}</h2>
              <GoldRule />
              {"paragraphs" in story
                ? story.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className={`mt-5 ${body}`}>
                      {paragraph}
                    </p>
                  ))
                : (
                    <p className={`mt-5 ${body}`}>{story.body}</p>
                  )}
            </div>
          </div>
        </section>
      ))}

      <section className="relative overflow-hidden">
        <img
          src={ABOUT_JOIN.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-navy/80" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center text-white md:py-28">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{ABOUT_JOIN.title}</h2>
          <p className="mt-5 text-base leading-relaxed text-white/90">{ABOUT_JOIN.body}</p>
          <Link
            href="/quote"
            className="mt-8 inline-flex rounded bg-button px-6 py-2.5 text-sm font-semibold text-button-text hover:bg-button/90"
          >
            Get Instant Quote
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <h2 className={`${heading} text-center`}>Why Choose Prime Box Printing?</h2>
        <GoldRule className="mx-auto" />
        <ol className="mt-12 space-y-8">
          {ABOUT_WHY.map((item) => (
            <li key={item.n} className="grid gap-3 border-b border-border/10 pb-8 last:border-0 md:grid-cols-[5rem_1fr] md:gap-8">
              <span className="text-3xl font-semibold text-button">{item.n}</span>
              <div>
                <h3 className="text-xl font-semibold text-navy">{item.title}</h3>
                <p className={`mt-2 ${body}`}>{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-navy/[0.04]">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
          <h2 className={`${heading} text-center`}>FAQs</h2>
          <GoldRule className="mx-auto" />
          <div className="mt-8">
            <ExclusiveAccordion
              items={ABOUT_FAQS.map((faq) => ({
                title: faq.question,
                content: <p className="px-4 pb-4 text-sm leading-relaxed text-muted">{faq.answer}</p>,
              }))}
            />
          </div>
        </div>
      </section>

      <HomeQuoteCta />
    </>
  );
}
