import { deleteCategoryAction, saveCategoryAction } from "@/app/admin/actions";
import { CategoryImageFields } from "@/components/admin/CategoryImageFields";
import { CategoryProductsFields } from "@/components/admin/CategoryProductsFields";
import { AdminPublishActions } from "@/components/admin/AdminPageBar";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { TitlePermalink } from "@/components/admin/TitlePermalink";
import { adminBox, adminBoxHead, adminField, adminMuted, adminTrashOnDark } from "@/components/admin/ui";
import { categoryDepth, categoryParentChoices, type Category, type Package } from "@/lib/catalog";

const FORM_ID = "category-save";

export function CategoryForm({
  category,
  categories,
  packages,
}: {
  category?: Category;
  categories: Category[];
  packages: Package[];
}) {
  const isNew = !category;
  const parentChoices = categoryParentChoices(categories, category?.slug);

  return (
    <div className="flex items-start gap-5">
      <AdminPublishActions
        isNew={isNew}
        formId={FORM_ID}
        trash={
          category ? (
            <form action={deleteCategoryAction}>
              <input type="hidden" name="slug" value={category.slug} />
              <ConfirmSubmit
                label="Move to Trash"
                message={`Move “${category.name}” to trash?`}
                className={adminTrashOnDark}
              />
            </form>
          ) : null
        }
      />
      <form id={FORM_ID} action={saveCategoryAction} className="min-w-0 flex-1 space-y-4">
        {category ? <input type="hidden" name="originalSlug" value={category.slug} /> : null}
        <TitlePermalink
          key={category?.slug ?? "new"}
          defaultName={category?.name}
          defaultSlug={category?.slug}
          prefix="/package-category/"
        />
        <div className={adminBox}>
          <h2 className={adminBoxHead}>Parent category</h2>
          <div className="space-y-2 p-3">
            <label className="block">
              <span className="text-sm font-medium text-navy">Parent</span>
              <select
                name="parentSlug"
                defaultValue={category?.parentSlug ?? ""}
                className={`${adminField} mt-1`}
              >
                <option value="">None (top level)</option>
                {parentChoices.map((entry) => (
                  <option key={entry.slug} value={entry.slug}>
                    {"—".repeat(categoryDepth(categories, entry.slug))}
                    {categoryDepth(categories, entry.slug) > 0 ? " " : ""}
                    {entry.name}
                  </option>
                ))}
              </select>
            </label>
            <p className={`text-xs ${adminMuted}`}>
              Subcategories inherit this category’s place in the hierarchy, like WordPress.
            </p>
          </div>
        </div>
        <div className={adminBox}>
          <h2 className={adminBoxHead}>Short description</h2>
          <div className="p-3">
            <textarea name="summary" rows={3} defaultValue={category?.summary} className={adminField} />
            <p className={`mt-1 text-xs ${adminMuted}`}>
              Shown on Shop by industry category cards (up to two lines).
            </p>
          </div>
        </div>
        <div className={adminBox}>
          <h2 className={adminBoxHead}>Description</h2>
          <div className="p-3">
            <textarea name="description" rows={6} defaultValue={category?.description} className={adminField} />
            <p className={`mt-1 text-xs ${adminMuted}`}>Shown under the title on the category page.</p>
          </div>
        </div>
        <div className={`${adminBox} !overflow-visible`}>
          <h2 className={adminBoxHead}>Home card supporting text</h2>
          <div className="p-3">
            <RichTextEditor
              name="cardSupportingText"
              defaultValue={category?.cardSupportingText}
              height={220}
              compact
              mediaSlug={category?.slug ?? "category-draft"}
            />
            <p className={`mt-1 text-xs ${adminMuted}`}>
              Appears under the short description on the Shop by industry card.
            </p>
          </div>
        </div>
      </form>

      <aside className="sticky top-6 z-10 w-[280px] shrink-0 space-y-4 self-start">
        <CategoryImageFields image={category?.image} />
        <div className={adminBox}>
          <h2 className={adminBoxHead}>Products</h2>
          <div className="p-3">
            <CategoryProductsFields packages={packages} categorySlug={category?.slug} formId={FORM_ID} />
          </div>
        </div>
      </aside>
    </div>
  );
}
