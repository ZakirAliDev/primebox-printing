"use client";

import { adminBox, adminField, adminGhost, adminMuted, adminPrimary } from "@/components/admin/ui";
import type { Category } from "@/lib/catalog";
import {
  FEATURED_CATEGORY_AUTOPLAY_MAX,
  FEATURED_CATEGORY_AUTOPLAY_MIN,
  FEATURED_CATEGORY_SLIDES_MAX,
  FEATURED_CATEGORY_SLIDES_MIN,
  type FeaturedCategorySettings,
  type FeaturedCategorySlides,
} from "@/lib/featured-category";

function Switch({
  checked,
  disabled,
  label,
  onToggle,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
        checked ? "bg-yellow" : "bg-navy/20"
      }`}
      onClick={onToggle}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

const SLIDE_FIELDS: { key: keyof FeaturedCategorySlides; label: string }[] = [
  { key: "base", label: "Mobile" },
  { key: "sm", label: "Small" },
  { key: "md", label: "Medium" },
  { key: "lg", label: "Large" },
  { key: "xl", label: "XL" },
];

export function FeaturedCategoryEditor({
  settings,
  categories,
  busy,
  onChange,
  onSave,
  onReset,
}: {
  settings: FeaturedCategorySettings;
  categories: Category[];
  busy: boolean;
  onChange: (next: FeaturedCategorySettings) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className={adminBox}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 px-4 py-3">
        <div>
          <h2 className="font-semibold text-navy">Featured category products</h2>
          <p className={`mt-0.5 text-xs ${adminMuted}`}>
            Home section with a product carousel using the global product card. Products come from the selected category.
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
        <label className="block space-y-1 text-sm text-navy">
          <span className="font-medium">Category</span>
          <select
            className={adminField}
            value={settings.categorySlug}
            disabled={busy}
            onChange={(event) => onChange({ ...settings, categorySlug: event.target.value })}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-nowrap items-center gap-4 overflow-x-auto text-sm text-navy">
          <label className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <Switch
              checked={settings.autoplay}
              disabled={busy}
              label="Autoplay featured products"
              onToggle={() => onChange({ ...settings, autoplay: !settings.autoplay })}
            />
            <span>Autoplay</span>
          </label>
          <label className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="text-navy/70">Interval</span>
            <input
              type="number"
              min={FEATURED_CATEGORY_AUTOPLAY_MIN}
              max={FEATURED_CATEGORY_AUTOPLAY_MAX}
              step={500}
              className={`${adminField} w-24`}
              value={settings.autoplayMs}
              disabled={busy || !settings.autoplay}
              onChange={(event) => onChange({ ...settings, autoplayMs: Number(event.target.value) })}
            />
            <span className="text-navy/70">(ms)</span>
          </label>
          {SLIDE_FIELDS.map((field) => (
            <label key={field.key} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
              <span className="text-navy/70">{field.label}</span>
              <input
                type="number"
                min={FEATURED_CATEGORY_SLIDES_MIN}
                max={FEATURED_CATEGORY_SLIDES_MAX}
                className={`${adminField} w-14`}
                value={settings.slides[field.key]}
                disabled={busy}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    slides: { ...settings.slides, [field.key]: Number(event.target.value) },
                  })
                }
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
