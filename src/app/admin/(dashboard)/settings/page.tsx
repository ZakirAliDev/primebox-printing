import { AdminPageIntro } from "@/components/admin/AdminPageBar";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalog } from "@/lib/catalog-store";

export const metadata = {
  title: "Site settings",
  robots: { index: false, follow: false },
};

export default async function AdminSiteSettingsPage() {
  await requireAdmin();
  const { siteSettings, categories } = await readCatalog();

  return (
    <div>
      <AdminPageIntro>Branding for the public site. Changes apply immediately.</AdminPageIntro>
      <SiteSettingsForm settings={siteSettings} categories={categories} />
    </div>
  );
}
