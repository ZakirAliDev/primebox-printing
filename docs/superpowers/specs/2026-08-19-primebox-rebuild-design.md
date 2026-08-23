# Prime Box Printing — custom rebuild

Date: 2026-08-19

## Goal

Replace WordPress + WooCommerce + Woodmart with a custom Next.js site that keeps the same business model and URLs, with a cleaner UI (navy / yellow / white). SEO and PageSpeed (90+) are the top requirements. Go live on `primeboxprinting.com` as the last step.

## Business model

- No add-to-cart. No product checkout.
- Public catalog + quote forms.
- Owner quotes customers off-site (email / WhatsApp).
- Owner creates the customer account and invoice in admin.
- Customer signs in, sees invoices, pays via Stripe.
- Webhook marks the invoice paid.

## Stack

- Next.js App Router + TypeScript + Tailwind
- Public pages: SSG/ISR, Server Components; client JS only where required
- Hosting: Cloudflare Pages (Workers / OpenNext)
- Database: Cloudflare D1
- Files: Cloudflare R2
- Payments: Stripe Checkout
- Auth: admin-created username/password only
- Domain: `primeboxprinting.com` (preserve MX records at cutover)

## Public routes (v1)

`/`, `/quote/`, `/packages/[slug]/`, `/package-category/[slug]/`, `/sign-in/`, `/account/`, plus content pages (about, contact, faq, blog, services, legal) matching current IA.

## Admin

`/admin` — products, categories, customers, invoices, quote inbox.

## Constraints

- Same color scheme; layout inspired by the live site, not a pixel clone
- Chat widgets must not load on first paint
- `/admin` and `/account` are not indexed
