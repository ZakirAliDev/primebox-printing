import { saveCategoryPageSettingsAction } from "@/app/admin/actions";
import { AdminPageActions } from "@/components/admin/AdminPageBar";
import { ResponsiveColumnFields } from "@/components/admin/ResponsiveColumnFields";
import { adminBox, adminBoxHead, adminField, adminMuted, adminPrimary } from "@/components/admin/ui";
import {
  CATEGORY_GRID_COLUMNS_MAX,
  CATEGORY_GRID_COLUMNS_MIN,
  CATEGORY_PAGINATION_STYLES,
  CATEGORY_PRODUCTS_PER_PAGE_MAX,
  CATEGORY_PRODUCTS_PER_PAGE_MIN,
  type CategoryPageSettings,
} from "@/lib/catalog";

const FORM_ID = "category-page-settings-save";

export function CategoryPageSettingsForm({ settings }: { settings: CategoryPageSettings }) {
  return (
    <div className="flex items-start gap-5">
      <AdminPageActions>
        <button form={FORM_ID} type="submit" className={adminPrimary}>
          Save settings
        </button>
      </AdminPageActions>

      <form id={FORM_ID} action={saveCategoryPageSettingsAction} className="flex min-w-0 flex-1 items-start gap-5">
        <div className="min-w-0 flex-1 space-y-4">
          <div className={adminBox}>
            <h2 className={adminBoxHead}>Category sidebar</h2>
            <div className="space-y-4 p-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="sidebarEnabled"
                  defaultChecked={settings.sidebarEnabled}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-navy">Show category list sidebar</span>
                  <span className={`mt-0.5 block text-xs ${adminMuted}`}>
                    Displays the full category tree on public category pages.
                  </span>
                </span>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy">Sidebar position</span>
                <select
                  name="sidebarPosition"
                  defaultValue={settings.sidebarPosition}
                  className={`${adminField} mt-1 max-w-xs`}
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
                <p className={`mt-1 text-xs ${adminMuted}`}>Only applies when the sidebar is enabled.</p>
              </label>
            </div>
          </div>
        </div>

        <aside className="sticky top-6 z-10 w-[320px] shrink-0 space-y-4 self-start">
          <div className={adminBox}>
            <h2 className={adminBoxHead}>Product card columns</h2>
            <div className="space-y-3 p-3">
              <p className={`text-sm ${adminMuted}`}>
                Number of product cards per row on category pages, from largest to smallest screen.
              </p>
              <ResponsiveColumnFields
                namePrefix="productGridColumns"
                values={settings.productGridColumns}
                min={CATEGORY_GRID_COLUMNS_MIN}
                max={CATEGORY_GRID_COLUMNS_MAX}
              />
            </div>
          </div>

          <div className={adminBox}>
            <h2 className={adminBoxHead}>Pagination</h2>
            <div className="space-y-4 p-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="paginationEnabled"
                  defaultChecked={settings.paginationEnabled}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-navy">Enable product pagination</span>
                  <span className={`mt-0.5 block text-xs ${adminMuted}`}>
                    Split category products across multiple pages instead of showing them all at once.
                  </span>
                </span>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy">Products per page</span>
                <input
                  type="number"
                  name="productsPerPage"
                  min={CATEGORY_PRODUCTS_PER_PAGE_MIN}
                  max={CATEGORY_PRODUCTS_PER_PAGE_MAX}
                  step={1}
                  defaultValue={settings.productsPerPage}
                  className={`${adminField} mt-1`}
                />
                <p className={`mt-1 text-xs ${adminMuted}`}>
                  Used when pagination is enabled. Between {CATEGORY_PRODUCTS_PER_PAGE_MIN} and{" "}
                  {CATEGORY_PRODUCTS_PER_PAGE_MAX} products.
                </p>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy">Pagination style</span>
                <select
                  name="paginationStyle"
                  defaultValue={settings.paginationStyle}
                  className={`${adminField} mt-1`}
                >
                  {CATEGORY_PAGINATION_STYLES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className={`mt-1 text-xs ${adminMuted}`}>
                  Choose how page links appear below the product grid.
                </p>
              </label>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
