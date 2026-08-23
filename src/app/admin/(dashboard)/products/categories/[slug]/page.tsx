import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalog } from "@/lib/catalog-store";

export const metadata = { title: "Edit category" };

type EditCategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export default async function EditCategoryPage({ params, searchParams }: EditCategoryPageProps) {
  await requireAdmin();
  const { slug } = await params;
  const { created, updated } = await searchParams;
  const { categories, packages } = await readCatalog();
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    notFound();
  }
  return (
    <div>
      <AdminNotice created={created} updated={updated} noun="Category" />
      <CategoryForm category={category} categories={categories} packages={packages} />
    </div>
  );
}
