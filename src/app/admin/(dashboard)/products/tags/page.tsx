import Link from "next/link";
import { bulkDeleteTagsAction, deleteTagAction } from "@/app/admin/actions";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageActions } from "@/components/admin/AdminPageBar";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { RowActions } from "@/components/admin/RowActions";
import { adminAddNew } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalog } from "@/lib/catalog-store";

export const metadata = { title: "Tags" };

type PageProps = {
  searchParams: Promise<{ q?: string; deleted?: string }>;
};

export default async function AdminTagsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { q = "", deleted } = await searchParams;
  const { tags } = await readCatalog();
  const query = q.trim().toLowerCase();
  const rows = query
    ? tags.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.slug.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query),
      )
    : tags;

  return (
    <div>
      <AdminPageActions>
        <Link href="/admin/products/tags/new" className={adminAddNew}>
          Add New
        </Link>
      </AdminPageActions>
      <AdminNotice deleted={deleted} noun="Tag" />
      <form className="mt-4 flex justify-end gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="Search tags" className="rounded border border-navy/20 px-2 py-1" />
        <button type="submit" className="rounded border border-navy/15 bg-white px-3 py-1.5 text-sm font-medium text-navy hover:border-yellow">
          Search Tags
        </button>
      </form>
      <form action={bulkDeleteTagsAction} className="mt-3">
        <div className="mb-2 flex items-center gap-2">
          <select name="bulk" defaultValue="" className="rounded border border-navy/20 bg-white px-2 py-1">
            <option value="">Bulk actions</option>
            <option value="trash">Move to Trash</option>
          </select>
          <ConfirmSubmit
            label="Apply"
            message="Move selected tags to trash?"
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
              <th className="p-2">Name</th>
              <th className="p-2">Description</th>
              <th className="p-2">Slug</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-navy/60">
                  No tags found.
                </td>
              </tr>
            ) : (
              rows.map((tag) => (
                <tr key={tag.slug} className="group border-t border-navy/10 transition-colors duration-200 hover:bg-navy/[0.04]">
                  <td className="p-2 align-top">
                    <input type="checkbox" name="slugs" value={tag.slug} />
                  </td>
                  <td className="p-2 align-top">
                    <Link href={`/admin/products/tags/${tag.slug}`} className="font-semibold text-navy hover:underline">
                      {tag.name}
                    </Link>
                    <RowActions>
                      <Link href={`/admin/products/tags/${tag.slug}`} className="text-navy hover:underline">
                        Edit
                      </Link>
                      <span className="text-navy/20">|</span>
                      <ConfirmSubmit
                        label="Trash"
                        message={`Move “${tag.name}” to trash?`}
                        name="slug"
                        value={tag.slug}
                        formAction={deleteTagAction}
                        className="text-red-700 hover:underline"
                      />
                    </RowActions>
                  </td>
                  <td className="p-2 align-top text-navy/60">{tag.summary || "—"}</td>
                  <td className="p-2 align-top text-navy/60">{tag.slug}</td>
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
