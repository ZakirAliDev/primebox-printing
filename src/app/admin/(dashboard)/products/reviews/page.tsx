import { bulkDeleteReviewsAction, deleteReviewAction } from "@/app/admin/actions";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { RowActions } from "@/components/admin/RowActions";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalog } from "@/lib/catalog-store";

export const metadata = { title: "Reviews" };

type PageProps = {
  searchParams: Promise<{ q?: string; deleted?: string }>;
};

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { q = "", deleted } = await searchParams;
  const { reviews, packages } = await readCatalog();
  const productName = Object.fromEntries(packages.map((item) => [item.slug, item.name]));
  const query = q.trim().toLowerCase();
  const rows = query
    ? reviews.filter((item) => {
        const product = productName[item.productSlug] ?? item.productSlug;
        return (
          product.toLowerCase().includes(query) ||
          item.author.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query)
        );
      })
    : reviews;

  return (
    <div>
      <AdminNotice deleted={deleted} noun="Review" />
      <form className="mt-4 flex justify-end gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="Search reviews" className="rounded border border-navy/20 px-2 py-1" />
        <button type="submit" className="rounded border border-navy/15 bg-white px-3 py-1.5 text-sm font-medium text-navy hover:border-yellow">
          Search Reviews
        </button>
      </form>
      <form action={bulkDeleteReviewsAction} className="mt-3">
        <div className="mb-2 flex items-center gap-2">
          <select name="bulk" defaultValue="" className="rounded border border-navy/20 bg-white px-2 py-1">
            <option value="">Bulk actions</option>
            <option value="trash">Move to Trash</option>
          </select>
          <ConfirmSubmit
            label="Apply"
            message="Move selected reviews to trash?"
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
              <th className="p-2">Product</th>
              <th className="p-2">Author</th>
              <th className="p-2">Rating</th>
              <th className="p-2">Review</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-navy/60">
                  No reviews yet.
                </td>
              </tr>
            ) : (
              rows.map((review) => (
                <tr key={review.id} className="group border-t border-navy/10 transition-colors duration-200 hover:bg-navy/[0.04]">
                  <td className="p-2 align-top">
                    <input type="checkbox" name="ids" value={review.id} />
                  </td>
                  <td className="p-2 align-top font-semibold text-navy">
                    {productName[review.productSlug] ?? review.productSlug}
                    <RowActions>
                      <ConfirmSubmit
                        label="Trash"
                        message="Move this review to trash?"
                        name="id"
                        value={review.id}
                        formAction={deleteReviewAction}
                        className="text-red-700 hover:underline"
                      />
                    </RowActions>
                  </td>
                  <td className="p-2 align-top">{review.author}</td>
                  <td className="p-2 align-top">{review.rating}/5</td>
                  <td className="p-2 align-top text-navy/60">{review.content}</td>
                  <td className="p-2 align-top text-navy/60">{review.createdAt}</td>
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
