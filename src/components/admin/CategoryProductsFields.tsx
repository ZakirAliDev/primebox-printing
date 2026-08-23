"use client";

import { useMemo, useState } from "react";
import { adminField, adminMuted } from "@/components/admin/ui";
import type { Package } from "@/lib/catalog";

function matchesQuery(item: Package, rawQuery: string) {
  const needle = rawQuery.normalize("NFKD").toLowerCase().trim();
  if (!needle) {
    return true;
  }
  return item.name.normalize("NFKD").toLowerCase().includes(needle);
}

export function CategoryProductsFields({
  packages,
  categorySlug,
  formId,
}: {
  packages: Package[];
  categorySlug?: string;
  formId: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => packages.filter((item) => matchesQuery(item, query)), [packages, query]);
  const selectedCount = categorySlug
    ? packages.filter((item) => item.categorySlugs.includes(categorySlug)).length
    : 0;

  return (
    <div className="space-y-3">
      <p className={`text-sm ${adminMuted}`}>
        Choose which products appear in this category on the storefront.
        {categorySlug ? ` ${selectedCount} selected.` : ""}
      </p>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products"
        autoComplete="off"
        className={adminField}
      />
      {packages.length === 0 ? (
        <p className={`text-sm ${adminMuted}`}>No products yet. Add products first, then assign them here.</p>
      ) : filtered.length === 0 ? (
        <p className={`text-sm ${adminMuted}`}>No products match “{query.trim()}”.</p>
      ) : (
        <div className="max-h-72 space-y-2 overflow-auto">
          {filtered.map((item) => (
            <label key={item.slug} className="flex cursor-pointer items-start gap-2 text-sm text-navy">
              <input
                form={formId}
                type="checkbox"
                name="productSlugs"
                value={item.slug}
                defaultChecked={categorySlug ? item.categorySlugs.includes(categorySlug) : false}
                className="mt-0.5"
              />
              <span>{item.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
