"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { adminBox, adminField, adminGhost, adminMuted, adminPrimary, adminTrash } from "@/components/admin/ui";
import type { Category } from "@/lib/catalog";
import type { ShopByIndustrySettings } from "@/lib/shop-by-industry";

function matchesQuery(item: Category, rawQuery: string) {
  const needle = rawQuery.normalize("NFKD").toLowerCase().trim();
  if (needle.length < 1) {
    return true;
  }
  const haystack = `${item.name} ${item.slug}`.normalize("NFKD").toLowerCase();
  return haystack.includes(needle);
}

export function ShopByIndustryEditor({
  settings,
  categories,
  busy,
  onChange,
  onSave,
  onReset,
}: {
  settings: ShopByIndustrySettings;
  categories: Category[];
  busy: boolean;
  onChange: (next: ShopByIndustrySettings) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () =>
      settings.categorySlugs
        .map((slug) => categories.find((item) => item.slug === slug))
        .filter((item): item is Category => Boolean(item)),
    [categories, settings.categorySlugs],
  );

  const available = useMemo(
    () =>
      categories.filter(
        (item) => !settings.categorySlugs.includes(item.slug) && matchesQuery(item, query),
      ),
    [categories, query, settings.categorySlugs],
  );

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const addSlug = (slug: string) => {
    if (settings.categorySlugs.includes(slug)) {
      return;
    }
    onChange({ ...settings, categorySlugs: [...settings.categorySlugs, slug] });
    setQuery("");
    setOpen(false);
  };

  const removeSlug = (slug: string) => {
    onChange({
      ...settings,
      categorySlugs: settings.categorySlugs.filter((value) => value !== slug),
    });
  };

  const moveSlug = (index: number, delta: number) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= settings.categorySlugs.length) {
      return;
    }
    const categorySlugs = [...settings.categorySlugs];
    const [item] = categorySlugs.splice(index, 1);
    categorySlugs.splice(nextIndex, 0, item);
    onChange({ ...settings, categorySlugs });
  };

  return (
    <div className={adminBox}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 px-4 py-3">
        <div>
          <h2 className="font-semibold text-navy">Shop by industry</h2>
          <p className={`mt-0.5 text-xs ${adminMuted}`}>
            Home page section. Pick categories to show as split image cards.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={adminGhost} disabled={busy} onClick={onReset}>
            Reset
          </button>
          <button type="button" className={adminPrimary} disabled={busy} onClick={onSave}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-navy">Section title</span>
          <input
            type="text"
            value={settings.title}
            disabled={busy}
            className={adminField}
            onChange={(event) => onChange({ ...settings, title: event.target.value })}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-navy">Supporting text</span>
          <textarea
            value={settings.subtitle}
            disabled={busy}
            rows={2}
            className={adminField}
            onChange={(event) => onChange({ ...settings, subtitle: event.target.value })}
          />
        </label>

        <div className="space-y-2" ref={wrapRef}>
          <span className="text-sm font-medium text-navy">Categories</span>
          <input
            type="text"
            value={query}
            disabled={busy}
            placeholder="Search categories to add"
            className={adminField}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
          {open ? (
            <ul className="max-h-56 overflow-auto rounded-lg border border-navy/15 bg-white shadow-sm">
              {available.length === 0 ? (
                <li className={`px-3 py-2 text-sm ${adminMuted}`}>No matching categories</li>
              ) : (
                available.map((item) => (
                  <li key={item.slug}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-navy/[0.04]"
                      onClick={() => addSlug(item.slug)}
                    >
                      {item.image ? (
                        <img src={item.image} alt="" className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded bg-navy/5 text-[10px] text-navy/40">
                          —
                        </span>
                      )}
                      <span>
                        <span className="block font-medium text-navy">{item.name}</span>
                        <span className={`block text-xs ${adminMuted}`}>{item.slug}</span>
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </div>

        {selected.length === 0 ? (
          <p className={`text-sm ${adminMuted}`}>
            No categories selected. The home section will be hidden until you add at least one.
          </p>
        ) : (
          <ul className="space-y-2">
            {selected.map((item, index) => (
              <li
                key={item.slug}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-navy/10 bg-navy/[0.02] p-3"
              >
                {item.image ? (
                  <img src={item.image} alt="" className="h-10 w-10 rounded object-cover" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded bg-navy/5 text-[10px] text-navy/40">
                    No img
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{item.name}</p>
                  <p className={`truncate text-xs ${adminMuted}`}>{item.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={adminGhost}
                    disabled={busy || index === 0}
                    aria-label="Move up"
                    onClick={() => moveSlug(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={adminGhost}
                    disabled={busy || index === selected.length - 1}
                    aria-label="Move down"
                    onClick={() => moveSlug(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={adminTrash}
                    disabled={busy}
                    aria-label="Remove"
                    onClick={() => removeSlug(item.slug)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
