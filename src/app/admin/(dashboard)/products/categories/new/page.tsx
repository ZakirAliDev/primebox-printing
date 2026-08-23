import { CategoryForm } from "@/components/admin/CategoryForm";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalog } from "@/lib/catalog-store";

export const metadata = { title: "Add New Category" };

export default async function NewCategoryPage() {
  await requireAdmin();
  const { categories, packages } = await readCatalog();
  return (
    <div>
      <CategoryForm categories={categories} packages={packages} />
    </div>
  );
}
