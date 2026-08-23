# Prime Box Printing

Custom Next.js rebuild of primeboxprinting.com.

Catalog and quote forms on the public site. Admin creates customer accounts and invoices. Customers pay through Stripe. No cart.

## Stack

- Next.js 16 (App Router)
- Cloudflare Pages + D1 + R2
- Stripe (payments)

## Local development

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm install
npm run dev
```

Open http://localhost:3000

## Cloudflare (later)

1. Create a D1 database: `npx wrangler d1 create primebox-printing`
2. Put the database id in `wrangler.jsonc`
3. Apply `migrations/0001_init.sql`
4. `npm run deploy`
5. Attach `primeboxprinting.com` in Cloudflare last. Do not change MX records.
