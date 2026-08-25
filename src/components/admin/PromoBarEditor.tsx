"use client";

import { adminBox, adminField, adminGhost, adminMuted, adminPrimary, adminTrash } from "@/components/admin/ui";
import {
  PROMO_BAR_AUTOPLAY_MAX,
  PROMO_BAR_AUTOPLAY_MIN,
  createPromoBarSlide,
  type PromoBarSettings,
  type PromoBarSlide,
} from "@/lib/promo-bar";

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

export function PromoBarEditor({
  promoBar,
  busy,
  onChange,
  onSave,
  onReset,
}: {
  promoBar: PromoBarSettings;
  busy: boolean;
  onChange: (next: PromoBarSettings) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  const updateSlide = (index: number, patch: Partial<PromoBarSlide>) => {
    onChange({
      ...promoBar,
      slides: promoBar.slides.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...patch } : slide,
      ),
    });
  };

  const moveSlide = (index: number, delta: number) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= promoBar.slides.length) {
      return;
    }
    const slides = [...promoBar.slides];
    const [item] = slides.splice(index, 1);
    slides.splice(nextIndex, 0, item);
    onChange({ ...promoBar, slides });
  };

  const removeSlide = (index: number) => {
    onChange({
      ...promoBar,
      slides: promoBar.slides.filter((_, slideIndex) => slideIndex !== index),
    });
  };

  return (
    <div className={adminBox}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 px-4 py-3">
        <div>
          <h2 className="font-semibold text-navy">Promo bar</h2>
          <p className={`mt-0.5 text-xs ${adminMuted}`}>
            Center text carousel in the top header strip. Works with one or more slides (infinite loop).
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
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-navy">
            <Switch
              checked={promoBar.autoplay}
              disabled={busy}
              label="Autoplay promo slides"
              onToggle={() => onChange({ ...promoBar, autoplay: !promoBar.autoplay })}
            />
            <span>Autoplay</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-navy">
            <span className="text-navy/70">Interval</span>
            <input
              type="number"
              min={PROMO_BAR_AUTOPLAY_MIN}
              max={PROMO_BAR_AUTOPLAY_MAX}
              step={500}
              value={promoBar.autoplayMs}
              disabled={busy || !promoBar.autoplay}
              className={`${adminField} w-28`}
              onChange={(event) =>
                onChange({
                  ...promoBar,
                  autoplayMs: Number(event.target.value),
                })
              }
            />
            <span className="text-navy/70">(ms)</span>
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-navy">Slides</p>
            <button
              type="button"
              className={adminGhost}
              disabled={busy}
              onClick={() =>
                onChange({
                  ...promoBar,
                  slides: [...promoBar.slides, createPromoBarSlide()],
                })
              }
            >
              Add slide
            </button>
          </div>

          {promoBar.slides.length === 0 ? (
            <p className={`text-sm ${adminMuted}`}>No slides yet. Add one to show text in the promo bar center.</p>
          ) : null}

          <ul className="space-y-2">
            {promoBar.slides.map((slide, index) => (
              <li
                key={slide.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-navy/10 bg-navy/[0.02] p-3"
              >
                <span className="w-6 text-center text-xs tabular-nums text-navy/50">{index + 1}</span>
                <input
                  type="text"
                  value={slide.text}
                  disabled={busy}
                  placeholder="Promo message"
                  className={`${adminField} min-w-0 flex-1`}
                  onChange={(event) => updateSlide(index, { text: event.target.value })}
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={adminGhost}
                    disabled={busy || index === 0}
                    aria-label="Move slide up"
                    onClick={() => moveSlide(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={adminGhost}
                    disabled={busy || index === promoBar.slides.length - 1}
                    aria-label="Move slide down"
                    onClick={() => moveSlide(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={adminTrash}
                    disabled={busy}
                    aria-label="Remove slide"
                    onClick={() => removeSlide(index)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
