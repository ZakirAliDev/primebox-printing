import Link from "next/link";
import { resolveFooterLogo, type SiteSettings } from "@/lib/catalog";
import { CONTACT, FOOTER, SITE_NAME } from "@/lib/site";

function LinkList({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">{title}</h2>
      <ul className="space-y-2 text-sm text-footer-text/80">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-footer-link">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ branding }: { branding: SiteSettings }) {
  const footerLogo = resolveFooterLogo(branding);
  const showLogo = Boolean(footerLogo);
  return (
    <footer className="mt-auto bg-footer text-footer-text">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          {showLogo ? (
            <img
              src={footerLogo}
              alt={SITE_NAME}
              className="w-auto max-w-full object-contain object-left"
              style={{ height: branding.logoFooterHeight }}
            />
          ) : (
            <p className="text-lg font-semibold">{SITE_NAME}</p>
          )}
          <p className="mt-2 text-sm text-footer-muted">
            Custom packaging from 100 boxes. Free design support. Houston, TX and Canada.
          </p>
          <a className="mt-3 block text-sm text-footer-link" href={`mailto:${CONTACT.salesEmail}`}>
            {CONTACT.salesEmail}
          </a>
        </div>
        <LinkList title="Company" links={FOOTER.company} />
        <LinkList title="Services" links={FOOTER.services} />
        <LinkList title="Resources" links={FOOTER.resources} />
        <div>
          <LinkList title="Help" links={FOOTER.help} />
          <p className="mt-6 text-xs text-footer-muted">{CONTACT.addressUs}</p>
          <p className="mt-1 text-xs text-footer-muted">{CONTACT.addressCa}</p>
        </div>
      </div>
      <div className="border-t border-footer-text/10 py-4 text-center text-xs text-footer-muted">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
