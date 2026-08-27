import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalogLive } from "@/lib/catalog-store";

export const metadata = { title: "Edit category" };

type EditCategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string; updated?: string; error?: string }>;
};

export default async function EditCategoryPage({ params, searchParams }: EditCategoryPageProps) {
  await requireAdmin();
  const { slug } = await params;
  const { created, updated, error } = await searchParams;
  const { categories, packages } = await readCatalogLive();
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    notFound();
  }
  return (
    <div>
      <AdminNotice created={created} updated={updated} error={error} noun="Category" />
      <CategoryForm category={category} categories={categories} packages={packages} />
    </div>
  );
}
