import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { AttributeForm } from "@/components/admin/AttributeForm";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalog } from "@/lib/catalog-store";

export const metadata = { title: "Edit attribute" };

type EditAttributePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export default async function EditAttributePage({ params, searchParams }: EditAttributePageProps) {
  await requireAdmin();
  const { slug } = await params;
  const { created, updated } = await searchParams;
  const attribute = (await readCatalog()).attributes.find((item) => item.slug === slug);
  if (!attribute) {
    notFound();
  }
  return (
    <div>
      <AdminNotice created={created} updated={updated} noun="Attribute" />
      <AttributeForm attribute={attribute} />
    </div>
  );
}
