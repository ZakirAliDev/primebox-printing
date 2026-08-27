import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPageIntro } from "@/components/admin/AdminPageBar";
import { CategoryPageSettingsForm } from "@/components/admin/CategoryPageSettingsForm";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalogLive } from "@/lib/catalog-store";

export const metadata = { title: "Category page settings" };

type PageProps = {
  searchParams: Promise<{ updated?: string }>;
};

export default async function CategoryPageSettingsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { updated } = await searchParams;
  const { categoryPageSettings } = await readCatalogLive();

  return (
    <div>
      <AdminPageIntro>These options apply to every public category page on the site.</AdminPageIntro>
      <AdminNotice updated={updated} noun="Category page settings" />
      <CategoryPageSettingsForm settings={categoryPageSettings} />
    </div>
  );
}
