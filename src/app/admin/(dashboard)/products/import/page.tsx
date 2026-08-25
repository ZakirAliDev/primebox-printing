import { ProductImportForm } from "@/components/admin/ProductImportForm";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata = { title: "Import products" };

export default async function ImportProductsPage() {
  await requireAdmin();
  return <ProductImportForm />;
}
