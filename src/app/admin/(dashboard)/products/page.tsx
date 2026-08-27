import Link from "next/link";
import { bulkDeletePackagesAction, deletePackageAction } from "@/app/admin/actions";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageActions } from "@/components/admin/AdminPageBar";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { RowActions } from "@/components/admin/RowActions";
import { adminAddNew, adminGhost } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalogLive } from "@/lib/catalog-store";

export const metadata = { title: "Products" };

type PageProps = {
  searchParams: Promise<{ q?: string; created?: string; updated?: string; deleted?: string }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { q = "", deleted } = await searchParams;
  const { packages, categories } = await readCatalogLive();
  const query = q.trim().toLowerCase();
  const rows = query
    ? packages.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.slug.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query),
      )
    : packages;
  const categoryName = Object.fromEntries(categories.map((item) => [item.slug, item.name]));

  return (
    <div>
      <AdminPageActions>
        <Link href="/admin/products/import" className={adminGhost}>
          Import
        </Link>
        <Link href="/admin/products/new" className={adminAddNew}>
          Add New
        </Link>
      </AdminPageActions>
      <AdminNotice deleted={deleted} noun="Product" />
      <form className="mt-4 flex justify-end gap-2" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products"
          className="rounded border border-navy/20 px-2 py-1"
        />
        <button type="submit" className="rounded border border-navy/15 bg-white px-3 py-1.5 text-sm font-medium text-navy hover:border-yellow">
          Search Products
        </button>
      </form>
      <form action={bulkDeletePackagesAction} className="mt-3">
        <div className="mb-2 flex items-center gap-2">
          <select name="bulk" defaultValue="" className="rounded border border-navy/20 bg-white px-2 py-1">
            <option value="">Bulk actions</option>
            <option value="trash">Move to Trash</option>
          </select>
          <ConfirmSubmit
            label="Apply"
            message="Move selected products to trash?"
            className="rounded border border-navy/15 bg-white px-3 py-1.5 text-sm font-medium text-navy hover:border-yellow"
          />
          <span className="text-navy/60">{rows.length} items</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-navy/[0.04]">
            <tr>
              <th className="w-8 p-2">
                <span className="sr-only">Select</span>
              </th>
              <th className="p-2">Title</th>
              <th className="p-2">Categories</th>
              <th className="p-2">Slug</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-navy/60">
                  No products found.
                </td>
              </tr>
            ) : (
              rows.map((item) => (
                <tr key={item.slug} className="group border-t border-navy/10 transition-colors duration-200 hover:bg-navy/[0.04]">
                  <td className="p-2 align-top">
                    <input type="checkbox" name="slugs" value={item.slug} />
                  </td>
                  <td className="p-2 align-top">
                    <Link href={`/admin/products/${item.slug}`} className="font-semibold text-navy hover:underline">
                      {item.name}
                    </Link>
                    <RowActions>
                      <Link href={`/admin/products/${item.slug}`} className="text-navy hover:underline">
                        Edit
                      </Link>
                      <span className="text-navy/20">|</span>
                      <Link href={`/packages/${item.slug}`} className="text-navy hover:underline">
                        View
                      </Link>
                      <span className="text-navy/20">|</span>
                      <ConfirmSubmit
                        label="Trash"
                        message={`Move “${item.name}” to trash?`}
                        name="slug"
                        value={item.slug}
                        formAction={deletePackageAction}
                        className="text-red-700 hover:underline"
                      />
                    </RowActions>
                  </td>
                  <td className="p-2 align-top text-navy/60">
                    {item.categorySlugs.map((slug) => categoryName[slug] ?? slug).join(", ") || "—"}
                  </td>
                  <td className="p-2 align-top text-navy/60">{item.slug}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </form>
    </div>
  );
}
