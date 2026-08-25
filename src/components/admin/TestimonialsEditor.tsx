"use client";

import { useRef } from "react";
import { adminBox, adminField, adminGhost, adminMuted, adminPrimary, adminTrash } from "@/components/admin/ui";
import {
  createHomeTestimonial,
  type HomeTestimonialsSettings,
} from "@/lib/home-testimonials";

export function TestimonialsEditor({
  settings,
  busy,
  onChange,
  onSave,
  onReset,
  onUploadStarIcon,
}: {
  settings: HomeTestimonialsSettings;
  busy: boolean;
  onChange: (next: HomeTestimonialsSettings) => void;
  onSave: () => void;
  onReset: () => void;
  onUploadStarIcon: (file: File) => void;
}) {
  const starRef = useRef<HTMLInputElement>(null);

  const updateItem = (index: number, patch: Partial<HomeTestimonialsSettings["items"][number]>) => {
    onChange({
      ...settings,
      items: settings.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    });
  };

  return (
    <div className={adminBox}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 px-4 py-3">
        <div>
          <h2 className="font-semibold text-navy">Testimonials</h2>
          <p className={`mt-0.5 text-xs ${adminMuted}`}>
            Home reviews. Each card shows the star icon, writer name, and quote.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={adminGhost} disabled={busy} onClick={onReset}>
            Reset
          </button>
          <button type="button" className={adminPrimary} disabled={busy} onClick={onSave}>
            Save
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-36 items-center justify-center overflow-hidden rounded border border-navy/15 bg-white px-2">
            {settings.starIcon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.starIcon} alt="Star icon" className="max-h-8 max-w-full object-contain" />
            ) : (
              <span className={`text-xs ${adminMuted}`}>No icon</span>
            )}
          </div>
          <input
            ref={starRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                onUploadStarIcon(file);
              }
            }}
          />
          <button
            type="button"
            className={adminGhost}
            disabled={busy}
            onClick={() => starRef.current?.click()}
          >
            Upload star icon
          </button>
        </div>

        <ul className="space-y-3">
          {settings.items.map((item, index) => (
            <li key={item.id} className="grid gap-2 rounded-lg border border-navy/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <label className="min-w-0 flex-1 text-xs font-medium text-navy">
                  Writer name
                  <input
                    value={item.name}
                    disabled={busy}
                    className={`${adminField} mt-1`}
                    onChange={(event) => updateItem(index, { name: event.target.value })}
                  />
                </label>
                <button
                  type="button"
                  className={adminTrash}
                  disabled={busy}
                  onClick={() =>
                    onChange({
                      ...settings,
                      items: settings.items.filter((_, itemIndex) => itemIndex !== index),
                    })
                  }
                >
                  Remove
                </button>
              </div>
              <label className="text-xs font-medium text-navy">
                Testimonial
                <textarea
                  rows={3}
                  value={item.text}
                  disabled={busy}
                  className={`${adminField} mt-1`}
                  onChange={(event) => updateItem(index, { text: event.target.value })}
                />
              </label>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={adminGhost}
          disabled={busy}
          onClick={() =>
            onChange({
              ...settings,
              items: [...settings.items, createHomeTestimonial()],
            })
          }
        >
          Add testimonial
        </button>
      </div>
    </div>
  );
}
