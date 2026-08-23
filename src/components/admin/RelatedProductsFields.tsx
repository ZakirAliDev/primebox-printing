"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { adminField, adminMuted } from "@/components/admin/ui";
import type { Package, RelatedMode } from "@/lib/catalog";

function matchesQuery(item: Package, rawQuery: string) {
  const needle = rawQuery.normalize("NFKD").toLowerCase().trim();
  if (needle.length < 1) {
    return true;
  }
  return item.name.normalize("NFKD").toLowerCase().startsWith(needle);
}

export function RelatedProductsFields({
  packages,
  currentSlug,
  defaultMode = "category",
  defaultSlugs = [],
}: {
  packages: Package[];
  currentSlug?: string;
  defaultMode?: RelatedMode;
  defaultSlugs?: string[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<RelatedMode>(defaultMode);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [selected, setSelected] = useState<string[]>(defaultSlugs);
  const choices = useMemo(
    () => packages.filter((item) => item.slug !== currentSlug),
    [packages, currentSlug],
  );
  const selectedItems = selected
    .map((slug) => choices.find((item) => item.slug === slug))
    .filter((item): item is Package => Boolean(item));
  const results = choices.filter((item) => matchesQuery(item, query));

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const place = () => {
      const box = wrapRef.current?.getBoundingClientRect();
      if (!box) {
        return;
      }
      const menuHeight = 224;
      const gap = 4;
      const spaceBelow = window.innerHeight - box.bottom - gap;
      const spaceAbove = box.top - gap;
      setDropUp(spaceBelow < menuHeight && spaceAbove > spaceBelow);
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, results.length]);

  const updateQuery = (value: string) => {
    setQuery(value);
    setOpen(true);
  };

  const toggle = (slug: string) => {
    setSelected((current) =>
      current.includes(slug) ? current.filter((value) => value !== slug) : [...current, slug],
    );
  };

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="radio"
          name="relatedMode"
          value="category"
          form="product-save"
          checked={mode === "category"}
          className="mt-1 cursor-pointer"
          onChange={() => setMode("category")}
        />
        <span>
          <span className="font-medium text-navy">Random from the same categories</span>
          <span className={`mt-0.5 block text-xs ${adminMuted}`}>
            Shows up to 3 other products that share this product’s categories.
          </span>
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="radio"
          name="relatedMode"
          value="manual"
          form="product-save"
          checked={mode === "manual"}
          className="mt-1 cursor-pointer"
          onChange={() => setMode("manual")}
        />
        <span className="font-medium text-navy">Select manually</span>
      </label>
      {selected.map((slug) => (
        <input key={slug} form="product-save" type="hidden" name="relatedSlugs" value={slug} />
      ))}
      {mode === "manual" ? (
        choices.length === 0 ? (
          <p className={`text-xs ${adminMuted}`}>Add more products first, then pick related ones here.</p>
        ) : (
          <div>
            <div ref={wrapRef} className="relative">
              <input
                type="text"
                id="related-product-query"
                defaultValue=""
                placeholder="Search products"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                lang="en"
                inputMode="search"
                className={`${adminField} cursor-text`}
                onFocus={() => setOpen(true)}
                onClick={() => setOpen(true)}
                onInput={(event) => updateQuery(event.currentTarget.value)}
                onKeyUp={(event) => updateQuery(event.currentTarget.value)}
                onCompositionUpdate={(event) => updateQuery(event.currentTarget.value)}
                onCompositionEnd={(event) => updateQuery(event.currentTarget.value)}
              />
              {open ? (
                <ul
                  className={`absolute z-20 max-h-56 w-full overflow-auto rounded border border-navy/20 bg-white shadow-lg ${
                    dropUp ? "bottom-full mb-1" : "top-full mt-1"
                  }`}
                >
                  {results.length === 0 ? (
                    <li className={`px-3 py-2 text-sm ${adminMuted}`}>No products match “{query.trim()}”.</li>
                  ) : (
                    results.map((item) => {
                      const isSelected = selected.includes(item.slug);
                      return (
                        <li key={item.slug}>
                          <button
                            type="button"
                            className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm hover:bg-navy/[0.06] ${
                              isSelected ? "bg-yellow/30 font-medium text-navy" : "text-navy"
                            }`}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => toggle(item.slug)}
                          >
                            {item.name}
                            {isSelected ? <span className="text-xs">Added</span> : null}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              ) : null}
            </div>
            {selectedItems.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {selectedItems.map((item) => (
                  <li
                    key={item.slug}
                    className="flex items-center gap-1 rounded border border-navy/15 bg-navy/[0.04] px-2 py-1 text-sm text-navy"
                  >
                    {item.name}
                    <button
                      type="button"
                      className="cursor-pointer text-navy/50 hover:text-red-700"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => toggle(item.slug)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`mt-2 text-xs ${adminMuted}`}>Click the search bar to choose related products.</p>
            )}
          </div>
        )
      ) : null}
    </div>
  );
}
