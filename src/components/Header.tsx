import Link from "next/link";
import { PromoBarCarousel } from "@/components/PromoBarCarousel";
import type { SiteSettings } from "@/lib/catalog";
import { CONTACT, NAV_LINKS, SITE_NAME } from "@/lib/site";

export function Header({ branding }: { branding: SiteSettings }) {
  const showLogo = Boolean(branding.logoInHeader && branding.logo);

  return (
    <header className="border-b border-border/10 bg-header text-header-text">
      <div className="bg-header-bar text-header-bar-text">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 text-sm">
          <Link href="/quote" className="shrink-0 rounded bg-button px-3 py-1 font-semibold text-button-text">
            Order in bulk — 25% off
          </Link>
          <div className="hidden min-w-0 flex-1 sm:block">
            <PromoBarCarousel settings={branding.promoBar} />
          </div>
          <Link href="/sign-in" className="shrink-0 rounded bg-button px-3 py-1 font-semibold text-button-text">
            Sign In
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5 sm:gap-5 sm:py-3">
        <Link href="/" className="shrink-0 font-semibold tracking-wide">
          {showLogo ? (
            <img
              src={branding.logo}
              alt={SITE_NAME}
              className="w-auto max-w-[9.5rem] object-contain object-left sm:max-w-[12rem]"
              style={{ height: branding.logoHeaderHeight }}
            />
          ) : (
            <>
              <span className="block text-lg leading-none">{SITE_NAME.toUpperCase()}</span>
              <span className="text-xs font-normal text-muted">Custom packaging</span>
            </>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <form action="/search">
            <label className="sr-only" htmlFor="site-search">
              Search for packages
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              required
              placeholder="Search for packages"
              className="w-full rounded-full border border-border/20 bg-surface px-4 py-1.5 text-sm outline-none focus:border-focus"
            />
          </form>

          <nav className="mt-5 hidden md:block" aria-label="Main">
            <ul className="flex w-full items-center justify-between gap-x-2 text-sm font-medium">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="min-w-0 shrink">
                  <Link
                    href={link.href}
                    className="whitespace-nowrap text-header-text/80 transition-colors hover:text-header-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="hidden shrink-0 text-right text-sm leading-snug lg:block">
          <p className="font-medium">Speak with our packaging expert</p>
          <a className="block text-header-text/80" href={`tel:${CONTACT.phoneUsTel}`}>
            {CONTACT.phoneUs}
          </a>
          <a className="block text-header-text/80" href={CONTACT.phoneWaLink}>
            {CONTACT.phoneWa}
          </a>
        </div>

        <Link
          href="/quote"
          className="shrink-0 rounded bg-button px-3.5 py-2 text-sm font-semibold text-button-text"
        >
          Get Instant Quote
        </Link>
      </div>

      <nav className="border-t border-border/10 px-4 py-2 md:hidden" aria-label="Main">
        <details>
          <summary className="cursor-pointer list-none text-sm font-medium">Menu</summary>
          <ul className="mt-2 flex flex-col gap-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </details>
      </nav>
    </header>
  );
}
