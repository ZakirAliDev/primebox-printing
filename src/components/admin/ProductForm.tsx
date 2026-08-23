import Link from "next/link";
import { deletePackageAction, savePackageAction } from "@/app/admin/actions";
import { AdminPublishActions } from "@/components/admin/AdminPageBar";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { ProductTabsEditor } from "@/components/admin/ProductTabsEditor";
import { ProductExtraContentEditor } from "@/components/admin/ProductExtraContentEditor";
import { ProductFaqsEditor } from "@/components/admin/ProductFaqsEditor";
import { ProductMediaFields } from "@/components/admin/ProductMediaFields";
import { RelatedProductsFields } from "@/components/admin/RelatedProductsFields";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { TitlePermalink } from "@/components/admin/TitlePermalink";
import { adminBox, adminBoxHead, adminMuted, adminTrashOnDark } from "@/components/admin/ui";
import { categoryDepth, orderedCategories, type Category, Package, ProductPageSettings, TabTemplate } from "@/lib/catalog";

export function ProductForm({
  product,
  categories,
  packages,
  templates,
  productPageSettings,
}: {
  product?: Package;
  categories: Category[];
  packages: Package[];
  templates: TabTemplate[];
  productPageSettings: ProductPageSettings;
}) {
  const isNew = !product;

  return (
    <div className="flex items-start gap-5">
      <AdminPublishActions
        isNew={isNew}
        formId="product-save"
        trash={
          product ? (
            <form action={deletePackageAction}>
              <input type="hidden" name="slug" value={product.slug} />
              <ConfirmSubmit
                label="Move to Trash"
                message={`Move “${product.name}” to trash?`}
                className={adminTrashOnDark}
              />
            </form>
          ) : null
        }
      />
      <form id="product-save" action={savePackageAction} className="min-w-0 flex-1 space-y-4">
        {product ? <input type="hidden" name="originalSlug" value={product.slug} /> : null}
        <TitlePermalink
          defaultName={product?.name}
          defaultSlug={product?.slug}
          prefix="/packages/"
        />
        <div className={`${adminBox} !overflow-visible`}>
          <h2 className={adminBoxHead}>Short description</h2>
          <div className="p-3">
            <RichTextEditor
              name="summary"
              defaultValue={product?.summary}
              height={220}
              mediaSlug={product?.slug ?? "draft"}
            />
            <p className={`mt-1 text-xs ${adminMuted}`}>Shown on category grids and under the product title.</p>
          </div>
        </div>
        <div className={`${adminBox} !overflow-visible`}>
          <h2 className={adminBoxHead}>Description</h2>
          <div className="p-3">
            <RichTextEditor
              name="body"
              defaultValue={product?.body}
              height={420}
              mediaSlug={product?.slug ?? "draft"}
            />
            <p className={`mt-1 text-xs ${adminMuted}`}>
              Default product data tab. Extra tabs turn this into a tabbed section on the product page.
            </p>
          </div>
        </div>
        <div className={`${adminBox} !overflow-visible`}>
          <h2 className={adminBoxHead}>Extra content</h2>
          <div className="p-3">
            <ProductExtraContentEditor
              defaultContent={product?.extraContent}
              defaultOverride={product?.extraContentOverride}
              globalEnabled={productPageSettings.globalExtraContentEnabled}
              mediaSlug={product?.slug ?? "draft"}
              productSlug={product?.slug}
            />
            <p className={`mt-3 text-xs ${adminMuted}`}>
              Shown under the Description on the product page.
            </p>
          </div>
        </div>
        <div className={`${adminBox} !overflow-visible`}>
          <h2 className={adminBoxHead}>Product data tabs</h2>
          <div className="p-3">
            <ProductTabsEditor
              defaultTabs={product?.tabs}
              defaultOverride={product?.tabsOverride}
              globalEnabled={productPageSettings.globalTabsEnabled}
              mediaSlug={product?.slug ?? "draft"}
              productSlug={product?.slug}
              templates={templates}
            />
            <p className={`mt-3 text-xs ${adminMuted}`}>
              Description is always the first tab. Extra tabs can use custom content or a shared template.
            </p>
          </div>
        </div>
        <div className={adminBox}>
          <h2 className={adminBoxHead}>FAQs</h2>
          <div className="p-3">
            <ProductFaqsEditor
              defaultFaqs={product?.faqs}
              defaultEnabled={product?.faqsEnabled}
              defaultOverride={product?.faqsOverride}
              globalEnabled={productPageSettings.globalFaqsEnabled}
              productSlug={product?.slug}
            />
            <p className={`mt-3 text-xs ${adminMuted}`}>
              Click a row to edit. Empty FAQs are not saved. Turn the toggle off to hide FAQs on the product page.
            </p>
          </div>
        </div>
      </form>

      <aside className="w-[280px] shrink-0 space-y-4">
        <ProductMediaFields image={product?.image} gallery={product?.gallery} />
        <div className={adminBox}>
          <h2 className={adminBoxHead}>Categories</h2>
          <div className="max-h-64 space-y-2 overflow-auto p-3">
            {categories.length === 0 ? (
              <p className={adminMuted}>No categories yet.</p>
            ) : (
              orderedCategories(categories).map((category) => (
                <label key={category.slug} className="flex items-center gap-2">
                  <input
                    form="product-save"
                    type="checkbox"
                    name="categorySlugs"
                    value={category.slug}
                    defaultChecked={product?.categorySlugs.includes(category.slug)}
                  />
                  <span>
                    {categoryDepth(categories, category.slug) > 0
                      ? `${"—".repeat(categoryDepth(categories, category.slug))} `
                      : ""}
                    {category.name}
                  </span>
                </label>
              ))
            )}
          </div>
          <p className="border-t border-navy/10 px-3 py-2">
            <Link href="/admin/products/categories/new" className="font-medium text-navy hover:underline">
              + Add new category
            </Link>
          </p>
        </div>
        <div className={`${adminBox} !overflow-visible`}>
          <h2 className={adminBoxHead}>Related products</h2>
          <div className="p-3">
            <RelatedProductsFields
              packages={packages}
              currentSlug={product?.slug}
              defaultMode={product?.relatedMode}
              defaultSlugs={product?.relatedSlugs}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
