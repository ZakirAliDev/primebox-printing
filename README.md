# Prime Box Printing

Custom Next.js rebuild of primeboxprinting.com.

Catalog and quote forms on the public site. Admin creates customer accounts and invoices. Customers pay through Stripe. No cart.

## Stack

- Next.js 16 (App Router)
- MySQL (catalog source of truth) + cache-first reads for page speed
- Stripe (payments) — planned

## Local development

```bash
npm install
docker compose up -d
# Ensure .env.local has:
# DATABASE_URL="mysql://primebox:primebox@127.0.0.1:3306/primebox"
npm run db:setup
npm run dev
```

Open http://localhost:3000

Without `DATABASE_URL`, the app reads/writes `src/data/catalog.json` (local only — writes fail on Vercel).

## MySQL + speed

- Catalog is one MySQL JSON row (`catalog_document`).
- Storefront memos the catalog and only reloads when `updatedAt` changes.
- Admin saves write MySQL and revalidate the site.

## Vercel (client review)

1. Create hosted MySQL (Railway, Aiven, or Hostinger remote).
2. Add `DATABASE_URL` to the Vercel project environment.
3. Locally with that URL: `npx prisma db push && npx tsx scripts/seed-catalog-db.ts`
4. Redeploy.

Later on Hostinger/SiteGround: same schema — point `DATABASE_URL` at their MySQL.

## Image uploads (Vercel Blob)

On Vercel, new admin image uploads go to **Vercel Blob** (not the server disk).

1. Vercel project → **Storage** → **Create** → **Blob** (Public access).
2. Connect it to this project (Production + Preview). Vercel adds `BLOB_READ_WRITE_TOKEN`.
3. Redeploy.
4. Optional locally: `npx vercel env pull` so uploads work in `npm run dev` too.

Without the token, local uploads still use `public/uploads/…`.
