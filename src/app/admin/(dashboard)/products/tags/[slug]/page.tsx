import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { TagForm } from "@/components/admin/TagForm";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalogLive } from "@/lib/catalog-store";

export const metadata = { title: "Edit tag" };

type EditTagPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export default async function EditTagPage({ params, searchParams }: EditTagPageProps) {
  await requireAdmin();
  const { slug } = await params;
  const { created, updated } = await searchParams;
  const tag = (await readCatalogLive()).tags.find((item) => item.slug === slug);
  if (!tag) {
    notFound();
  }
  return (
    <div>
      <AdminNotice created={created} updated={updated} noun="Tag" />
      <TagForm tag={tag} />
    </div>
  );
}
