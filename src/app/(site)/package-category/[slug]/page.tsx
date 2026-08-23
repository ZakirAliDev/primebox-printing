import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryLoadMoreGrid } from "@/components/CategoryLoadMoreGrid";
import { CategoryPagination } from "@/components/CategoryPagination";
import { CategoryProductCountBar } from "@/components/CategoryProductCountBar";
import { CategoryProductsSection } from "@/components/CategoryProductCount";
import { CategorySidebar } from "@/components/CategorySidebar";
import { ProductCard, type ProductCardItem } from "@/components/ProductCard";
import {
  categoryBreadcrumbs,
  categoryChildren,
  categoryProductGridVars,
  packageCoverImage,
  paginateCategoryProducts,
  parseCategoryPageNumber,
} from "@/lib/catalog";
import { readCatalog } from "@/lib/catalog-store";
import { plainTextFromHtml } from "@/lib/rich-text";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateStaticParams() {
  const { categories } = await readCatalog();
  return categories.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const { categories } = await readCatalog();
  const category = categories.find((item) => item.slug === slug);
  return {
    title: category ? category.name : "Category",
    description: category?.summary || category?.description,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const { categories, packages: allPackages, categoryPageSettings } = await readCatalog();
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    notFound();
  }

  const breadcrumbs = categoryBreadcrumbs(categories, slug);
  const children = categoryChildren(categories, slug);
  const packages = allPackages.filter((item) => item.categorySlugs.includes(slug));
  const productItems: ProductCardItem[] = packages.map((item) => ({
    slug: item.slug,
    name: item.name,
    summary: plainTextFromHtml(item.summary),
    image: packageCoverImage(item),
  }));
  const useLoadMore =
    categoryPageSettings.paginationEnabled && categoryPageSettings.paginationStyle === "load-more";
  const pagination = useLoadMore
    ? null
    : paginateCategoryProducts(
        productItems,
        parseCategoryPageNumber(pageParam),
        categoryPageSettings.productsPerPage,
        categoryPageSettings.paginationEnabled,
      );
  const sidebar = categoryPageSettings.sidebarEnabled ? (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <CategorySidebar categories={categories} activeSlug={slug} />
    </aside>
  ) : null;
  const layoutClass =
    categoryPageSettings.sidebarEnabled && categoryPageSettings.sidebarPosition === "right"
      ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,240px)]"
      : categoryPageSettings.sidebarEnabled
        ? "lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]"
        : "";
  const productGridVars = categoryProductGridVars(categoryPageSettings.productGridColumns);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {breadcrumbs.length > 1 ? (
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.slug}>
              {index > 0 ? <span className="mx-2">/</span> : null}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-navy">{crumb.name}</span>
              ) : (
                <Link href={`/package-category/${crumb.slug}`} className="hover:text-navy hover:underline">
                  {crumb.name}
                </Link>
              )}
            </span>
          ))}
        </nav>
      ) : (
        <p className="text-sm font-medium text-muted">Shop by category</p>
      )}

      <div className={`mt-8 grid gap-8 lg:items-start ${layoutClass}`.trim()}>
        {categoryPageSettings.sidebarEnabled && categoryPageSettings.sidebarPosition === "left" ? sidebar : null}

        <div className="min-w-0">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="aspect-square w-full max-w-[280px] rounded-lg object-cover bg-navy/5"
              />
            ) : null}
            <div className={category.image ? "" : "lg:col-span-2"}>
              <h1 className="text-4xl font-semibold">{category.name}</h1>
              {category.description || category.summary ? (
                <p className="mt-3 max-w-2xl text-muted">{category.description || category.summary}</p>
              ) : null}
            </div>
          </div>

          {children.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-xl font-semibold">Subcategories</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {children.map((child) => (
                  <li key={child.slug}>
                    <Link
                      href={`/package-category/${child.slug}`}
                      className="flex items-center gap-4 overflow-hidden rounded-lg border border-border/10 bg-surface p-4 hover:border-yellow"
                    >
                      {child.image ? (
                        <img src={child.image} alt="" className="h-16 w-16 shrink-0 rounded object-cover bg-navy/5" />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-navy/5 text-xs text-muted">
                          {child.name.slice(0, 1)}
                        </div>
                      )}
                      <span className="font-semibold">{child.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {useLoadMore ? (
            <CategoryLoadMoreGrid
              items={productItems}
              perPage={categoryPageSettings.productsPerPage}
              gridStyle={productGridVars}
            />
          ) : packages.length > 0 ? (
            <CategoryProductsSection>
              <ul className="category-product-grid grid gap-6" style={productGridVars}>
                {pagination?.items.map((item) => (
                  <li key={item.slug} className="h-full">
                    <ProductCard item={item} />
                  </li>
                ))}
              </ul>
              {categoryPageSettings.paginationEnabled && pagination ? (
                <CategoryPagination
                  slug={slug}
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  style={categoryPageSettings.paginationStyle}
                />
              ) : null}
              <CategoryProductCountBar
                visible={pagination?.items.length ?? productItems.length}
                total={productItems.length}
              />
            </CategoryProductsSection>
          ) : null}
          {packages.length === 0 ? (
            <p className="mt-8 text-muted">Products for this category will appear here once added in admin.</p>
          ) : null}
        </div>

        {categoryPageSettings.sidebarEnabled && categoryPageSettings.sidebarPosition === "right" ? sidebar : null}
      </div>
    </div>
  );
}
