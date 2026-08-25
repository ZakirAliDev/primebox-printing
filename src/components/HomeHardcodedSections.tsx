import Link from "next/link";
import { ExclusiveAccordion } from "@/components/Accordion";
import {
  HOME_BENEFITS,
  HOME_BENEFITS_TITLE,
  HOME_CTA_LABEL,
  HOME_CTA_TITLE,
  HOME_FAQS,
  HOME_PREMADE,
  HOME_PROCESS_STEPS,
  HOME_PROCESS_TITLE,
  HOME_QUOTE_SUBTITLE,
  HOME_QUOTE_TITLE,
  HOME_STATS,
  HOME_STATS_POINTS,
  HOME_STATS_TITLE,
  HOME_SUSTAINABILITY,
  HOME_TESTIMONIALS_EYEBROW,
  HOME_TESTIMONIALS_INTRO,
  HOME_TESTIMONIALS_TITLE,
  HOME_WHY_BODY,
  HOME_WHY_TITLE,
} from "@/data/home-sections";
import type { HomeTestimonialsSettings } from "@/lib/home-testimonials";

const heading =
  "text-2xl font-semibold tracking-tight text-navy sm:text-3xl md:text-[2rem] md:leading-tight";
const body = "text-sm leading-relaxed text-muted sm:text-base md:text-[1.05rem] md:leading-7";

function ProcessIcon({ name }: { name: (typeof HOME_PROCESS_STEPS)[number]["title"] }) {
  const className = "h-8 w-8 text-navy";
  if (name === "Online Support") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
        <path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.1-3.2A8 8 0 0 1 4 12Z" />
        <path d="M9 11h.01M12 11h.01M15 11h.01" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "Free Designing") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
        <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5" />
        <path d="m15 18 3.5-3.5a1.5 1.5 0 0 1 2.1 2.1L17 20h-2v-2Z" />
      </svg>
    );
  }
  if (name === "Payment Process") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18M7 15h3" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "Production") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
        <path d="M4 20V9l6-3 6 3v11" />
        <path d="M10 20v-7h4v7M4 20h16" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <path d="M3 16V8h11l3 3h4v5H3Z" />
      <circle cx="7.5" cy="18.5" r="1.5" />
      <circle cx="17.5" cy="18.5" r="1.5" />
    </svg>
  );
}

export function HomeProcess() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12 md:py-16">
      <h2 className={`${heading} text-center`}>{HOME_PROCESS_TITLE}</h2>
      <ol className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[2.35rem] right-[8%] left-[8%] hidden h-[3px] rounded-full bg-gradient-to-r from-navy via-button to-navy lg:block"
        />
        {HOME_PROCESS_STEPS.map((step) => (
          <li key={step.n} className="relative">
            <article className="flex h-full flex-col items-center rounded-2xl border border-navy/10 bg-surface px-4 pb-6 pt-5 text-center shadow-[0_12px_30px_rgba(18,49,90,0.08)]">
              <span className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-[3px] border-button bg-white shadow-sm">
                <ProcessIcon name={step.title} />
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
                  {step.n}
                </span>
              </span>
              <h3 className="mt-4 text-base font-semibold text-navy">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function HomeStats() {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 className="mx-auto max-w-3xl text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-[2rem] md:leading-tight">
          {HOME_STATS_TITLE}
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          {HOME_STATS.map((stat) => (
            <li key={stat.label} className="text-center">
              <p className="text-3xl font-semibold text-white sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-white/80">{stat.label}</p>
            </li>
          ))}
        </ul>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {HOME_STATS_POINTS.map((point) => (
            <li key={point} className="flex gap-2 text-sm leading-relaxed text-white/85">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-button" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeQuoteIntro() {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <h2 className={heading}>{HOME_QUOTE_TITLE}</h2>
      <p className={`mt-3 ${body}`}>{HOME_QUOTE_SUBTITLE}</p>
    </div>
  );
}

export function HomeBenefits() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12 md:py-16">
      <h2 className={`${heading} mx-auto max-w-3xl text-center`}>{HOME_BENEFITS_TITLE}</h2>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HOME_BENEFITS.map((item) => (
          <li
            key={item.title}
            className="flex items-center gap-4 rounded-lg border border-border/10 bg-surface px-5 py-5 text-base font-semibold text-navy shadow-sm"
          >
            <img src={item.icon} alt="" className="h-12 w-12 shrink-0 object-contain" />
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomeSustainability() {
  return (
    <section className="bg-navy/[0.04]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
        {[HOME_SUSTAINABILITY, HOME_PREMADE].map((block) => (
          <div key={block.title} className="rounded-lg border border-border/10 bg-surface p-8">
            <p className="text-xs font-semibold tracking-[0.18em] text-button">{block.eyebrow}</p>
            <h2 className="mt-2 text-xl font-semibold text-navy sm:text-2xl">{block.title}</h2>
            <ul className="mt-5 space-y-2">
              {block.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-navy" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HomeTestimonials({ settings }: { settings: HomeTestimonialsSettings }) {
  if (settings.items.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12 md:py-16">
      <p className="text-center text-xs font-semibold tracking-[0.18em] text-button">
        {HOME_TESTIMONIALS_EYEBROW}
      </p>
      <h2 className={`${heading} mt-2 text-center`}>{HOME_TESTIMONIALS_TITLE}</h2>
      <p className={`mx-auto mt-4 max-w-3xl text-center ${body}`}>{HOME_TESTIMONIALS_INTRO}</p>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {settings.items.map((review) => (
          <li key={review.id} className="rounded-lg border border-border/10 bg-surface p-6 shadow-sm">
            {settings.starIcon ? (
              <img src={settings.starIcon} alt="5 star rating" className="mb-4 h-8 w-auto object-contain" />
            ) : null}
            <h3 className="text-base font-semibold text-navy">{review.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{review.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomeWhyChoose() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className={`${heading} text-center`}>{HOME_WHY_TITLE}</h2>
        <p className={`mt-4 text-center ${body}`}>{HOME_WHY_BODY}</p>
      </div>
      <div className="mx-auto mt-8 max-w-3xl">
        <ExclusiveAccordion
          items={HOME_FAQS.map((faq) => ({
            title: faq.question,
            content: <p className="px-4 pb-4 text-sm leading-relaxed text-muted">{faq.answer}</p>,
          }))}
        />
      </div>
    </section>
  );
}

export function HomeQuoteCta() {
  return (
    <section className="bg-button">
      <div className="mx-auto max-w-4xl px-4 py-12 text-center md:py-16">
        <h2 className="text-xl font-semibold leading-snug text-navy sm:text-2xl md:text-[1.75rem] md:leading-tight">
          {HOME_CTA_TITLE}
        </h2>
        <Link
          href="/quote"
          className="mt-8 inline-flex rounded bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
        >
          {HOME_CTA_LABEL}
        </Link>
      </div>
    </section>
  );
}
