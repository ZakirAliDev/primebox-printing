import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalog } from "@/lib/catalog-store";

export const metadata = { title: "Add New Product" };

export default async function NewProductPage() {
  await requireAdmin();
  const { categories, packages, tabTemplates, productPageSettings } = await readCatalog();
  return (
    <div>
      <ProductForm
        categories={categories}
        packages={packages}
        templates={tabTemplates}
        productPageSettings={productPageSettings}
      />
    </div>
  );
}
