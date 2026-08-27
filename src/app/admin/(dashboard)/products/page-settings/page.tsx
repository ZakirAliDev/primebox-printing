import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageIntro } from "@/components/admin/AdminPageBar";
import { ProductPageSettingsForm } from "@/components/admin/ProductPageSettingsForm";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalogLive } from "@/lib/catalog-store";

export const metadata = { title: "Product page settings" };

type PageProps = {
  searchParams: Promise<{ updated?: string }>;
};

export default async function ProductPageSettingsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { updated } = await searchParams;
  const { productPageSettings, tabTemplates } = await readCatalogLive();

  return (
    <div>
      <AdminPageIntro>These options apply to every product page on the site.</AdminPageIntro>
      <AdminNotice updated={updated} noun="Product page settings" />
      <ProductPageSettingsForm settings={productPageSettings} templates={tabTemplates} />
    </div>
  );
}
