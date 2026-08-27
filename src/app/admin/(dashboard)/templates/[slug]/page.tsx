import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { TemplateForm } from "@/components/admin/TemplateForm";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalogLive } from "@/lib/catalog-store";

export const metadata = { title: "Edit template" };

type EditTemplatePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export default async function EditTemplatePage({ params, searchParams }: EditTemplatePageProps) {
  await requireAdmin();
  const { slug } = await params;
  const { created, updated } = await searchParams;
  const template = (await readCatalogLive()).tabTemplates.find((item) => item.slug === slug);
  if (!template) {
    notFound();
  }
  return (
    <div>
      <AdminNotice created={created} updated={updated} noun="Template" />
      <TemplateForm template={template} />
    </div>
  );
}
