import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/AdminNotice";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin-auth";
import { readCatalogLive } from "@/lib/catalog-store";

export const metadata = { title: "Edit product" };

type EditProductPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string; updated?: string }>;
};

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  await requireAdmin();
  const { slug } = await params;
  const { created, updated } = await searchParams;
  const { packages, categories, tabTemplates, productPageSettings } = await readCatalogLive();
  const product = packages.find((item) => item.slug === slug);
  if (!product) {
    notFound();
  }
  return (
    <div>
      <AdminNotice created={created} updated={updated} noun="Product" />
      <ProductForm
        product={product}
        categories={categories}
        packages={packages}
        templates={tabTemplates}
        productPageSettings={productPageSettings}
      />
    </div>
  );
}
