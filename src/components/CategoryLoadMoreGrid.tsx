"use client";

import { useState } from "react";
import { CategoryProductCountBar } from "@/components/CategoryProductCountBar";
import { CategoryProductsSection } from "@/components/CategoryProductCount";
import { ProductCard, type ProductCardItem } from "@/components/ProductCard";

export function CategoryLoadMoreGrid({
  items,
  perPage,
  gridStyle,
}: {
  items: ProductCardItem[];
  perPage: number;
  gridStyle: Record<string, string>;
}) {
  const [visibleCount, setVisibleCount] = useState(() => Math.min(perPage, items.length));
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <CategoryProductsSection>
      <ul className="category-product-grid grid gap-6" style={gridStyle}>
        {visibleItems.map((item) => (
          <li key={item.slug} className="h-full">
            <ProductCard item={item} />
          </li>
        ))}
      </ul>
      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="inline-flex rounded bg-button px-6 py-2.5 text-sm font-semibold text-button-text hover:bg-button/90"
            onClick={() => setVisibleCount((count) => Math.min(count + perPage, items.length))}
          >
            Load more products
          </button>
        </div>
      ) : null}
      <CategoryProductCountBar visible={visibleItems.length} total={items.length} />
    </CategoryProductsSection>
  );
}
