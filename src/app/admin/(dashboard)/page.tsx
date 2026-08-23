import Link from "next/link";
import { AdminPageActions, AdminPageIntro } from "@/components/admin/AdminPageBar";
import { adminAddNew } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalog } from "@/lib/catalog-store";
import { plainTextFromHtml } from "@/lib/rich-text";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  await requireAdmin();
  const { categories, packages, tags, attributes, reviews } = await readCatalog();
  const recentProducts = [...packages].slice(-6).reverse();
  const categoryPreview = categories.slice(0, 6).map((category) => ({
    ...category,
    count: packages.filter((item) => item.categorySlugs.includes(category.slug)).length,
  }));

  const stats = [
    { href: "/admin/products", label: "Products", value: packages.length },
    { href: "/admin/products/categories", label: "Categories", value: categories.length },
    { href: "/admin/products/tags", label: "Tags", value: tags.length },
    { href: "/admin/products/reviews", label: "Reviews", value: reviews.length },
  ];

  return (
    <div>
      <AdminPageIntro>
        Manage the catalog that powers the public site — products, categories, and related product data.
      </AdminPageIntro>
      <AdminPageActions>
        <Link href="/admin/products/new" className={adminAddNew}>
          Add new product
        </Link>
      </AdminPageActions>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.href}>
            <Link
              href={stat.href}
              className="block rounded-xl border border-navy/10 bg-white p-5 shadow-sm transition hover:border-yellow"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/55">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{stat.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <section className="rounded-xl border border-navy/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-navy/10 px-5 py-4">
            <h2 className="text-base font-semibold">Recent products</h2>
            <Link href="/admin/products" className="text-sm font-medium text-navy/70 hover:text-navy">
              View all
            </Link>
          </div>
          {recentProducts.length === 0 ? (
            <p className="px-5 py-8 text-sm text-navy/60">No products yet. Publish the first one.</p>
          ) : (
            <ul>
              {recentProducts.map((item) => (
                <li key={item.slug} className="border-b border-navy/5 last:border-0">
                  <Link
                    href={`/admin/products/${item.slug}`}
                    className="flex items-start justify-between gap-4 px-5 py-3.5 hover:bg-navy/[0.03]"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-navy/60">
                        {plainTextFromHtml(item.summary)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-navy/45">{item.slug}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-navy/10 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold">Quick actions</h2>
            <ul className="mt-4 grid gap-2">
              <li>
                <Link
                  href="/admin/products/new"
                  className="block rounded-lg bg-yellow px-4 py-2.5 text-center text-sm font-semibold text-navy"
                >
                  Add new product
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/products/categories/new"
                  className="block rounded-lg border border-navy/15 px-4 py-2.5 text-center text-sm font-semibold hover:border-yellow"
                >
                  Add category
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/products/attributes/new"
                  className="block rounded-lg border border-navy/15 px-4 py-2.5 text-center text-sm font-semibold hover:border-yellow"
                >
                  Add attribute
                </Link>
              </li>
            </ul>
            <p className="mt-4 text-xs text-navy/50">
              {attributes.length} attribute{attributes.length === 1 ? "" : "s"} in the catalog
            </p>
          </section>

          <section className="rounded-xl border border-navy/10 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-navy/10 px-5 py-4">
              <h2 className="text-base font-semibold">Categories</h2>
              <Link
                href="/admin/products/categories"
                className="text-sm font-medium text-navy/70 hover:text-navy"
              >
                Manage
              </Link>
            </div>
            <ul>
              {categoryPreview.map((category) => (
                <li key={category.slug} className="border-b border-navy/5 last:border-0">
                  <Link
                    href={`/admin/products/categories/${category.slug}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-navy/[0.03]"
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className="rounded-full bg-navy/5 px-2 py-0.5 text-xs font-semibold tabular-nums">
                      {category.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
