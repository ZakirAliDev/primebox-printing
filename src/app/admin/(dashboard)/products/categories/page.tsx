import Link from "next/link";
import { bulkDeleteCategoriesAction, deleteCategoryAction } from "@/app/admin/actions";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageActions } from "@/components/admin/AdminPageBar";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { RowActions } from "@/components/admin/RowActions";
import { adminAddNew, adminGhost } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { orderedCategories } from "@/lib/catalog";
import { readCatalogLive } from "@/lib/catalog-store";

export const metadata = { title: "Categories" };

type PageProps = {
  searchParams: Promise<{ q?: string; deleted?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { q = "", deleted } = await searchParams;
  const { categories, packages } = await readCatalogLive();
  const query = q.trim().toLowerCase();
  const rows = query
    ? categories.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.slug.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query),
      )
    : categories;
  const categoryName = Object.fromEntries(categories.map((item) => [item.slug, item.name]));
  const displayRows = query
    ? [...rows].sort((a, b) => a.name.localeCompare(b.name))
    : orderedCategories(categories);

  return (
    <div>
      <AdminPageActions>
        <Link href="/admin/products/categories/page-settings" className={adminGhost}>
          Category page settings
        </Link>
        <Link href="/admin/products/categories/new" className={adminAddNew}>
          Add New
        </Link>
      </AdminPageActions>
      <AdminNotice deleted={deleted} noun="Category" />
      <form className="mt-4 flex justify-end gap-2" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search categories"
          className="rounded border border-navy/20 px-2 py-1"
        />
        <button type="submit" className="rounded border border-navy/15 bg-white px-3 py-1.5 text-sm font-medium text-navy hover:border-yellow">
          Search Categories
        </button>
      </form>
      <form action={bulkDeleteCategoriesAction} className="mt-3">
        <div className="mb-2 flex items-center gap-2">
          <select name="bulk" defaultValue="" className="rounded border border-navy/20 bg-white px-2 py-1">
            <option value="">Bulk actions</option>
            <option value="trash">Move to Trash</option>
          </select>
          <ConfirmSubmit
            label="Apply"
            message="Move selected categories to trash?"
            className="rounded border border-navy/15 bg-white px-3 py-1.5 text-sm font-medium text-navy hover:border-yellow"
          />
          <span className="text-navy/60">{displayRows.length} items</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-navy/[0.04]">
            <tr>
              <th className="w-8 p-2">
                <span className="sr-only">Select</span>
              </th>
              <th className="p-2">Name</th>
              <th className="p-2">Parent</th>
              <th className="p-2">Slug</th>
              <th className="p-2">Count</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-navy/60">
                  No categories found.
                </td>
              </tr>
            ) : (
              displayRows.map((category) => {
                const count = packages.filter((item) => item.categorySlugs.includes(category.slug)).length;
                return (
                  <tr key={category.slug} className="group border-t border-navy/10 transition-colors duration-200 hover:bg-navy/[0.04]">
                    <td className="p-2 align-top">
                      <input type="checkbox" name="slugs" value={category.slug} />
                    </td>
                    <td className="p-2 align-top">
                      <Link
                        href={`/admin/products/categories/${category.slug}`}
                        className="font-semibold text-navy hover:underline"
                      >
                        {category.name}
                      </Link>
                      <RowActions>
                        <Link href={`/admin/products/categories/${category.slug}`} className="text-navy hover:underline">
                          Edit
                        </Link>
                        <span className="text-navy/20">|</span>
                        <Link href={`/package-category/${category.slug}`} className="text-navy hover:underline">
                          View
                        </Link>
                        <span className="text-navy/20">|</span>
                        <ConfirmSubmit
                          label="Trash"
                          message={`Move “${category.name}” to trash?`}
                          name="slug"
                          value={category.slug}
                          formAction={deleteCategoryAction}
                          className="text-red-700 hover:underline"
                        />
                      </RowActions>
                    </td>
                    <td className="p-2 align-top text-navy/60">
                      {category.parentSlug ? categoryName[category.parentSlug] ?? category.parentSlug : "—"}
                    </td>
                    <td className="p-2 align-top text-navy/60">{category.slug}</td>
                    <td className="p-2 align-top text-navy/60">{count}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </form>
    </div>
  );
}
