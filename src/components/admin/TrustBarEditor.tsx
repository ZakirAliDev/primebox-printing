"use client";

import { useRef } from "react";
import { adminBox, adminField, adminGhost, adminMuted, adminPrimary, adminTrash } from "@/components/admin/ui";
import {
  TRUST_BAR_AUTOPLAY_MAX,
  TRUST_BAR_AUTOPLAY_MIN,
  TRUST_BAR_IMAGE_HEIGHT_MAX,
  TRUST_BAR_IMAGE_HEIGHT_MIN,
  TRUST_BAR_SLIDES_SHOW_MAX,
  TRUST_BAR_SLIDES_SHOW_MIN,
  createTrustBarSlide,
  type TrustBarImage,
  type TrustBarSettings,
} from "@/lib/trust-bar";

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

function ImageSlotEditor({
  title,
  item,
  busy,
  inline = false,
  onChange,
  onUpload,
  onClear,
}: {
  title: string;
  item: TrustBarImage;
  busy: boolean;
  inline?: boolean;
  onChange: (patch: Partial<TrustBarImage>) => void;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = (
    <div className="flex h-14 w-28 shrink-0 items-center justify-center overflow-hidden rounded border border-navy/15 bg-white px-2">
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={item.alt || title} className="max-h-12 max-w-full object-contain" />
      ) : (
        <span className={`text-xs ${adminMuted}`}>No image</span>
      )}
    </div>
  );

  const uploadControls = (
    <>
      <button
        type="button"
        className={adminGhost}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Uploading…" : item.image ? "Replace" : "Upload"}
      </button>
      {item.image ? (
        <button type="button" className={adminGhost} disabled={busy} onClick={onClear}>
          Clear
        </button>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            onUpload(file);
          }
        }}
      />
    </>
  );

  const urlField = (
    <label className="flex min-w-[180px] flex-1 items-center gap-2 text-sm text-navy">
      <span className="shrink-0 whitespace-nowrap text-navy/70">Optional URL</span>
      <input
        type="url"
        className={adminField}
        value={item.href}
        disabled={busy}
        placeholder="https://"
        onChange={(event) => onChange({ href: event.target.value })}
      />
    </label>
  );

  const altField = (
    <label className="flex min-w-[160px] flex-1 items-center gap-2 text-sm text-navy">
      <span className="shrink-0 whitespace-nowrap text-navy/70">Alt text</span>
      <input
        type="text"
        className={adminField}
        value={item.alt}
        disabled={busy}
        onChange={(event) => onChange({ alt: event.target.value })}
      />
    </label>
  );

  if (inline) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {preview}
        <div className="flex shrink-0 flex-wrap items-center gap-2">{uploadControls}</div>
        {urlField}
        {altField}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-navy/10 bg-navy/[0.02] p-3">
      <p className="text-sm font-medium text-navy">{title}</p>
      <div className="flex flex-wrap items-center gap-2">
        {preview}
        {uploadControls}
      </div>
      <label className="block space-y-1 text-sm text-navy">
        <span className="text-navy/70">Optional URL</span>
        <input
          type="url"
          className={adminField}
          value={item.href}
          disabled={busy}
          placeholder="https://"
          onChange={(event) => onChange({ href: event.target.value })}
        />
      </label>
      <label className="block space-y-1 text-sm text-navy">
        <span className="text-navy/70">Alt text</span>
        <input
          type="text"
          className={adminField}
          value={item.alt}
          disabled={busy}
          onChange={(event) => onChange({ alt: event.target.value })}
        />
      </label>
    </div>
  );
}

export function TrustBarEditor({
  trustBar,
  busy,
  onChange,
  onSave,
  onReset,
  onUploadStill,
  onUploadSlide,
}: {
  trustBar: TrustBarSettings;
  busy: boolean;
  onChange: (next: TrustBarSettings) => void;
  onSave: () => void;
  onReset: () => void;
  onUploadStill: (index: 0 | 1, file: File) => void;
  onUploadSlide: (index: number, file: File) => void;
}) {
  const updateStill = (index: 0 | 1, patch: Partial<TrustBarImage>) => {
    const stills: TrustBarSettings["stills"] = [...trustBar.stills];
    stills[index] = { ...stills[index], ...patch };
    onChange({ ...trustBar, stills });
  };

  const updateSlide = (index: number, patch: Partial<TrustBarImage>) => {
    onChange({
      ...trustBar,
      carousel: {
        ...trustBar.carousel,
        slides: trustBar.carousel.slides.map((slide, slideIndex) =>
          slideIndex === index ? { ...slide, ...patch } : slide,
        ),
      },
    });
  };

  const moveSlide = (index: number, delta: number) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= trustBar.carousel.slides.length) {
      return;
    }
    const slides = [...trustBar.carousel.slides];
    const [item] = slides.splice(index, 1);
    slides.splice(nextIndex, 0, item);
    onChange({ ...trustBar, carousel: { ...trustBar.carousel, slides } });
  };

  const removeSlide = (index: number) => {
    onChange({
      ...trustBar,
      carousel: {
        ...trustBar.carousel,
        slides: trustBar.carousel.slides.filter((_, slideIndex) => slideIndex !== index),
      },
    });
  };

  return (
    <div className={adminBox}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 px-4 py-3">
        <div>
          <h2 className="font-semibold text-navy">Trust / logo bar</h2>
          <p className={`mt-0.5 text-xs ${adminMuted}`}>
            Two still images on the left and a logo carousel on the right, under the hero.
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

      <div className="space-y-5 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <ImageSlotEditor
            title="Still image 1"
            item={trustBar.stills[0]}
            busy={busy}
            onChange={(patch) => updateStill(0, patch)}
            onUpload={(file) => onUploadStill(0, file)}
            onClear={() => updateStill(0, { image: "" })}
          />
          <ImageSlotEditor
            title="Still image 2"
            item={trustBar.stills[1]}
            busy={busy}
            onChange={(patch) => updateStill(1, patch)}
            onUpload={(file) => onUploadStill(1, file)}
            onClear={() => updateStill(1, { image: "" })}
          />
        </div>

        <div className="flex flex-nowrap items-center gap-4 overflow-x-auto text-sm text-navy">
          <label className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <Switch
              checked={trustBar.carousel.autoplay}
              disabled={busy}
              label="Autoplay logo carousel"
              onToggle={() =>
                onChange({
                  ...trustBar,
                  carousel: { ...trustBar.carousel, autoplay: !trustBar.carousel.autoplay },
                })
              }
            />
            <span>Autoplay</span>
          </label>
          <label className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="text-navy/70">Interval</span>
            <input
              type="number"
              min={TRUST_BAR_AUTOPLAY_MIN}
              max={TRUST_BAR_AUTOPLAY_MAX}
              step={500}
              className={`${adminField} w-24`}
              value={trustBar.carousel.autoplayMs}
              disabled={busy || !trustBar.carousel.autoplay}
              onChange={(event) =>
                onChange({
                  ...trustBar,
                  carousel: { ...trustBar.carousel, autoplayMs: Number(event.target.value) },
                })
              }
            />
            <span className="text-navy/70">(ms)</span>
          </label>
          <label className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="text-navy/70">Still size</span>
            <input
              type="number"
              min={TRUST_BAR_IMAGE_HEIGHT_MIN}
              max={TRUST_BAR_IMAGE_HEIGHT_MAX}
              className={`${adminField} w-16`}
              value={trustBar.stillHeight}
              disabled={busy}
              onChange={(event) =>
                onChange({ ...trustBar, stillHeight: Number(event.target.value) })
              }
            />
            <span className="text-navy/70">(px)</span>
          </label>
          <label className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="text-navy/70">Carousel size</span>
            <input
              type="number"
              min={TRUST_BAR_IMAGE_HEIGHT_MIN}
              max={TRUST_BAR_IMAGE_HEIGHT_MAX}
              className={`${adminField} w-16`}
              value={trustBar.slideHeight}
              disabled={busy}
              onChange={(event) =>
                onChange({ ...trustBar, slideHeight: Number(event.target.value) })
              }
            />
            <span className="text-navy/70">(px)</span>
          </label>
          <label className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="text-navy/70">Desktop slides</span>
            <input
              type="number"
              min={TRUST_BAR_SLIDES_SHOW_MIN}
              max={TRUST_BAR_SLIDES_SHOW_MAX}
              className={`${adminField} w-16`}
              value={trustBar.carousel.slidesToShowDesktop}
              disabled={busy}
              onChange={(event) =>
                onChange({
                  ...trustBar,
                  carousel: {
                    ...trustBar.carousel,
                    slidesToShowDesktop: Number(event.target.value),
                  },
                })
              }
            />
          </label>
          <label className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="text-navy/70">Mobile slides</span>
            <input
              type="number"
              min={TRUST_BAR_SLIDES_SHOW_MIN}
              max={TRUST_BAR_SLIDES_SHOW_MAX}
              className={`${adminField} w-16`}
              value={trustBar.carousel.slidesToShowMobile}
              disabled={busy}
              onChange={(event) =>
                onChange({
                  ...trustBar,
                  carousel: {
                    ...trustBar.carousel,
                    slidesToShowMobile: Number(event.target.value),
                  },
                })
              }
            />
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-navy">Carousel slides</p>
            <button
              type="button"
              className={adminGhost}
              disabled={busy}
              onClick={() =>
                onChange({
                  ...trustBar,
                  carousel: {
                    ...trustBar.carousel,
                    slides: [...trustBar.carousel.slides, createTrustBarSlide()],
                  },
                })
              }
            >
              Add slide
            </button>
          </div>

          {trustBar.carousel.slides.length === 0 ? (
            <p className={`text-sm ${adminMuted}`}>No carousel slides yet.</p>
          ) : (
            <ul className="space-y-3">
              {trustBar.carousel.slides.map((slide, index) => (
                <li key={slide.id} className="rounded-lg border border-navy/10 p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-navy">Slide {index + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={adminGhost}
                        disabled={busy || index === 0}
                        onClick={() => moveSlide(index, -1)}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className={adminGhost}
                        disabled={busy || index === trustBar.carousel.slides.length - 1}
                        onClick={() => moveSlide(index, 1)}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        className={adminTrash}
                        disabled={busy}
                        onClick={() => removeSlide(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <ImageSlotEditor
                    title="Logo image"
                    item={slide}
                    busy={busy}
                    inline
                    onChange={(patch) => updateSlide(index, patch)}
                    onUpload={(file) => onUploadSlide(index, file)}
                    onClear={() => updateSlide(index, { image: "" })}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
