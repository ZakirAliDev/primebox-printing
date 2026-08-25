# Prime Box Printing

Custom Next.js rebuild of primeboxprinting.com.

Catalog and quote forms on the public site. Admin creates customer accounts and invoices. Customers pay through Stripe. No cart.

## Stack

- Next.js 16 (App Router)
- Hostinger MySQL (catalog source of truth) + cache-first reads for page speed
- Local disk uploads under `public/uploads/`
- Stripe (payments) — planned

## Local development

```bash
npm install
docker compose up -d
# Ensure .env.local has:
# DATABASE_URL="mysql://primebox:primebox@127.0.0.1:3306/primebox"
npm run db:setup   # one-time: create tables + seed from src/data/catalog.json
npm run dev
```

Open http://localhost:3000

Runtime catalog is **MySQL only** — `catalog.json` is never read by the live app (seed script only).

## Hostinger production

1. Create a MySQL database + user in hPanel → **Databases**.
2. Set environment variables on the Node app:

```text
ADMIN_PASSWORD=…          # admin login
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=…                 # e.g. u821685055_primebox_admin
DB_PASSWORD=…             # MySQL password
DB_NAME=…                 # e.g. u821685055_primebox
```

Do **not** set Railway or Vercel Blob variables.

3. Deploy from GitHub (`main`), Node.js / Next.js.
4. After the first page load or admin save, phpMyAdmin should show `catalog_document` and `admin_preview`.

Images upload to `public/uploads/` on the Hostinger disk.
