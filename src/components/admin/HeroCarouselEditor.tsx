"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { FontFamilyPicker } from "@/components/admin/FontFamilyPicker";
import { adminField, adminGhost, adminMuted, adminPrimary, adminTrash } from "@/components/admin/ui";
import { normalizeHexColor } from "@/lib/color-scheme";
import { canAddCustomFont } from "@/lib/google-fonts";
import {
  HERO_AUTOPLAY_MAX,
  HERO_AUTOPLAY_MIN,
  HERO_FONT_SIZE_MAX,
  HERO_FONT_SIZE_MIN,
  HERO_HEIGHT_MAX,
  HERO_HEIGHT_MIN,
  HERO_PADDING_MAX,
  HERO_PADDING_MIN,
  HERO_TRANSITION_MAX,
  HERO_TRANSITION_MIN,
  createHeroSlide,
  type HeroSettings,
  type HeroSlide,
  type HeroTextStyle,
  type HeroTypography,
} from "@/lib/hero-slides";

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

function clampDraftNumber(raw: string, fallback: number, min: number, max: number) {
  const next = Number(raw);
  if (!Number.isFinite(next)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(next)));
}

function NumberDraftInput({
  value,
  min,
  max,
  disabled,
  className,
  ariaLabel,
  name,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  disabled: boolean;
  className: string;
  ariaLabel?: string;
  name: string;
  onChange: (value: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const committed = useRef(value);

  useEffect(() => {
    committed.current = value;
    const node = inputRef.current;
    if (node && document.activeElement !== node) {
      node.value = String(value);
    }
  }, [value]);

  const commit = (node: HTMLInputElement) => {
    const next = clampDraftNumber(node.value, committed.current, min, max);
    committed.current = next;
    node.value = String(next);
    onChange(next);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      name={name}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      aria-label={ariaLabel}
      defaultValue={String(value)}
      disabled={disabled}
      className={className}
      onFocus={(event) => event.currentTarget.select()}
      onInput={(event) => {
        const node = event.currentTarget;
        const cleaned = node.value.replace(/\D/g, "");
        if (node.value !== cleaned) {
          node.value = cleaned;
        }
      }}
      onBlur={(event) => commit(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
    />
  );
}

function NumberRow({
  label,
  value,
  min,
  max,
  suffix,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm text-navy">{label}</span>
      <span className="flex items-center gap-2">
        <NumberDraftInput
          name={`hero-${label.toLowerCase().replace(/\s+/g, "-")}`}
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          className={`${adminField} w-24 py-1`}
          onChange={onChange}
        />
        <span className="w-8 text-xs text-navy/55">{suffix}</span>
      </span>
    </label>
  );
}

function HexColorRow({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm text-navy">{label}</span>
      <span className="flex items-center gap-2">
        <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-navy/20 shadow-sm">
          <span className="absolute inset-0" style={{ background: value }} />
          <input
            type="color"
            value={value}
            disabled={disabled}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            onChange={(event) => onChange(event.target.value)}
          />
        </span>
        <input
          type="text"
          value={draft}
          disabled={disabled}
          className={`${adminField} w-24 py-1 font-mono text-xs uppercase`}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => onChange(normalizeHexColor(draft, value))}
        />
      </span>
    </label>
  );
}

function SettingCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-navy/15 bg-white">
      <h3 className="border-b border-navy/10 bg-navy/[0.04] px-3 py-2 text-sm font-semibold text-navy">{title}</h3>
      <div className="space-y-3 p-3">{children}</div>
    </div>
  );
}

function TypeFields({
  label,
  value,
  extras,
  disabled,
  onChange,
}: {
  label: string;
  value: HeroTextStyle;
  extras: string[];
  disabled: boolean;
  onChange: (value: HeroTextStyle) => void;
}) {
  return (
    <>
      <span className="self-center text-xs font-semibold uppercase tracking-wide text-navy/50">{label}</span>
      <FontFamilyPicker
        compact
        value={value.fontFamily}
        extras={extras}
        disabled={disabled}
        onChange={(fontFamily) => onChange({ ...value, fontFamily })}
      />
      <label className={`${adminField} flex h-[38px] max-h-[38px] items-center gap-1 px-2 py-0`}>
        <NumberDraftInput
          name={`hero-font-size-${label.toLowerCase().replace(/\s+/g, "-")}`}
          value={value.fontSize}
          min={HERO_FONT_SIZE_MIN}
          max={HERO_FONT_SIZE_MAX}
          disabled={disabled}
          ariaLabel={`${label} font size`}
          className="h-full min-w-0 flex-1 bg-transparent text-sm leading-none text-navy outline-none"
          onChange={(fontSize) => onChange({ ...value, fontSize })}
        />
        <span className="shrink-0 text-xs text-navy/55">px</span>
      </label>
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`h-3.5 w-3.5 shrink-0 text-navy/50 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        open ? "rotate-180" : ""
      }`}
    >
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function AccordionPanel({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className="min-h-0 overflow-hidden" aria-hidden={!open} inert={!open}>
        {children}
      </div>
    </div>
  );
}

export function HeroCarouselEditor({
  hero,
  busy,
  onChange,
  onSave,
  onReset,
  onUpload,
}: {
  hero: HeroSettings;
  busy: boolean;
  onChange: (next: HeroSettings) => void;
  onSave: () => void;
  onReset: () => void;
  onUpload: (file: File, target: number | "container") => Promise<void>;
}) {
  const [openId, setOpenId] = useState<string | null>(hero.slides[0]?.id ?? null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const patch = (partial: Partial<HeroSettings>) => onChange({ ...hero, ...partial });

  const patchType = (key: keyof HeroTypography, value: HeroTextStyle) => {
    const extras = hero.customFonts ?? [];
    onChange({
      ...hero,
      customFonts: canAddCustomFont(value.fontFamily, extras) ? [...extras, value.fontFamily] : extras,
      typography: { ...hero.typography, [key]: value },
    });
  };

  const updateSlide = (index: number, partial: Partial<HeroSlide>) => {
    onChange({
      ...hero,
      slides: hero.slides.map((slide, slideIndex) => (slideIndex === index ? { ...slide, ...partial } : slide)),
    });
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= hero.slides.length) {
      return;
    }
    const slides = [...hero.slides];
    const [slide] = slides.splice(index, 1);
    slides.splice(nextIndex, 0, slide);
    onChange({ ...hero, slides });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-navy/10 bg-navy/[0.04] px-3 py-2">
        <h2 className="font-semibold text-navy">Home carousel</h2>
        <div className="flex gap-2">
          <button type="button" className={adminGhost} disabled={busy} onClick={onReset}>
            Reset
          </button>
          <button type="button" className={adminPrimary} disabled={busy} onClick={onSave}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid items-stretch gap-4 p-4 lg:grid-cols-3">
        <SettingCard title="Playback">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-navy">Autoplay</span>
            <Switch
              checked={hero.autoplay}
              disabled={busy}
              label="Autoplay slides"
              onToggle={() => patch({ autoplay: !hero.autoplay })}
            />
          </div>
          <NumberRow
            label="Autoplay interval"
            value={hero.autoplayMs}
            min={HERO_AUTOPLAY_MIN}
            max={HERO_AUTOPLAY_MAX}
            suffix="ms"
            disabled={busy || !hero.autoplay}
            onChange={(autoplayMs) => patch({ autoplayMs })}
          />
          <NumberRow
            label="Slide speed"
            value={hero.transitionMs}
            min={HERO_TRANSITION_MIN}
            max={HERO_TRANSITION_MAX}
            suffix="ms"
            disabled={busy}
            onChange={(transitionMs) => patch({ transitionMs })}
          />
        </SettingCard>

        <SettingCard title="Display">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-navy">Pause on hover</span>
            <Switch
              checked={hero.pauseOnHover}
              disabled={busy}
              label="Pause autoplay on hover"
              onToggle={() => patch({ pauseOnHover: !hero.pauseOnHover })}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-navy">Show arrows</span>
            <Switch
              checked={hero.showArrows}
              disabled={busy}
              label="Show carousel arrows"
              onToggle={() => patch({ showArrows: !hero.showArrows })}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-navy">Arrows on hover</span>
            <Switch
              checked={Boolean(hero.arrowsOnHover)}
              disabled={busy || !hero.showArrows}
              label="Show carousel arrows only on hover"
              onToggle={() => patch({ arrowsOnHover: !hero.arrowsOnHover })}
            />
          </div>
          <NumberRow
            label="Section height"
            value={hero.height ?? 430}
            min={HERO_HEIGHT_MIN}
            max={HERO_HEIGHT_MAX}
            suffix="px"
            disabled={busy}
            onChange={(height) => patch({ height })}
          />
          <NumberRow
            label="Content padding top"
            value={hero.paddingTop ?? 40}
            min={HERO_PADDING_MIN}
            max={HERO_PADDING_MAX}
            suffix="px"
            disabled={busy}
            onChange={(paddingTop) => patch({ paddingTop })}
          />
          <NumberRow
            label="Content padding bottom"
            value={hero.paddingBottom ?? 40}
            min={HERO_PADDING_MIN}
            max={HERO_PADDING_MAX}
            suffix="px"
            disabled={busy}
            onChange={(paddingBottom) => patch({ paddingBottom })}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-navy">Heading color animation</span>
            <Switch
              checked={hero.animateHeading}
              disabled={busy}
              label="Animate heading color"
              onToggle={() => patch({ animateHeading: !hero.animateHeading })}
            />
          </div>
          <HexColorRow
            label="Container background"
            value={hero.background ?? "#ffffff"}
            disabled={busy}
            onChange={(background) => patch({ background })}
          />
          <div className="flex items-start justify-between gap-3">
            <span className="pt-1 text-sm text-navy">Background image</span>
            <div className="flex items-center gap-2">
              <div className="flex h-[38px] w-16 items-center justify-center overflow-hidden rounded border border-navy/15 bg-navy/[0.03]">
                {hero.backgroundImage ? (
                  <img src={hero.backgroundImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className={`text-[10px] ${adminMuted}`}>None</span>
                )}
              </div>
              <button
                type="button"
                className={adminGhost}
                disabled={busy}
                onClick={() => fileRefs.current.container?.click()}
              >
                {hero.backgroundImage ? "Replace" : "Upload"}
              </button>
              {hero.backgroundImage ? (
                <button type="button" className={adminGhost} disabled={busy} onClick={() => patch({ backgroundImage: "" })}>
                  Remove
                </button>
              ) : null}
              <input
                ref={(node) => {
                  fileRefs.current.container = node;
                }}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) {
                    void onUpload(file, "container");
                  }
                }}
              />
            </div>
          </div>
        </SettingCard>

        <SettingCard title="Typography">
          <div className="grid grid-cols-[max-content_minmax(0,1fr)_5.75rem] items-center gap-x-2 gap-y-3">
            <TypeFields
              label="Heading"
              value={hero.typography.heading}
              extras={hero.customFonts}
              disabled={busy}
              onChange={(value) => patchType("heading", value)}
            />
            <TypeFields
              label="Subheading"
              value={hero.typography.subheading}
              extras={hero.customFonts}
              disabled={busy}
              onChange={(value) => patchType("subheading", value)}
            />
            <TypeFields
              label="Supporting line"
              value={hero.typography.supporting}
              extras={hero.customFonts}
              disabled={busy}
              onChange={(value) => patchType("supporting", value)}
            />
            <TypeFields
              label="Button label"
              value={hero.typography.button}
              extras={hero.customFonts}
              disabled={busy}
              onChange={(value) => patchType("button", value)}
            />
          </div>
        </SettingCard>
      </div>

      <div className="divide-y divide-navy/10 border-t border-navy/10">
        {hero.slides.map((slide, index) => {
          const open = openId === slide.id;
          return (
            <section key={slide.id}>
              <div className="flex items-center gap-2 px-3">
                <button
                  type="button"
                  aria-expanded={open}
                  className="flex min-w-0 flex-1 items-center gap-3 py-2.5 text-left hover:bg-navy/[0.03]"
                  onClick={() => setOpenId(open ? null : slide.id)}
                >
                  <span className="w-16 shrink-0 text-xs font-semibold text-navy/50">Slide {index + 1}</span>
                  <span className="min-w-0 truncate text-sm text-navy">{slide.heading || "Untitled slide"}</span>
                  <Chevron open={open} />
                </button>
                <button
                  type="button"
                  className={adminGhost}
                  disabled={busy || index === 0}
                  aria-label="Move slide up"
                  onClick={() => moveSlide(index, -1)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className={adminGhost}
                  disabled={busy || index === hero.slides.length - 1}
                  aria-label="Move slide down"
                  onClick={() => moveSlide(index, 1)}
                >
                  Down
                </button>
                <button
                  type="button"
                  className={adminTrash}
                  disabled={busy}
                  onClick={() => {
                    const slides = hero.slides.filter((_, slideIndex) => slideIndex !== index);
                    onChange({ ...hero, slides });
                    if (openId === slide.id) {
                      setOpenId(slides[Math.max(0, index - 1)]?.id ?? null);
                    }
                  }}
                >
                  Remove
                </button>
              </div>
              <AccordionPanel open={open}>
                <div className="grid gap-4 bg-navy/[0.03] px-3 py-3 md:grid-cols-[160px_minmax(0,1fr)]">
                  <div className="space-y-2">
                    <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg border border-navy/15 bg-white">
                      {slide.image ? (
                        <img src={slide.image} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className={`text-xs ${adminMuted}`}>No image</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={adminGhost}
                        disabled={busy}
                        onClick={() => fileRefs.current[slide.id]?.click()}
                      >
                        {slide.image ? "Replace" : "Upload"}
                      </button>
                      {slide.image ? (
                        <button
                          type="button"
                          className={adminGhost}
                          disabled={busy}
                          onClick={() => updateSlide(index, { image: "" })}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <input
                      ref={(node) => {
                        fileRefs.current[slide.id] = node;
                      }}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) {
                          void onUpload(file, index);
                        }
                      }}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-navy">Heading</span>
                      <input
                        type="text"
                        value={slide.heading}
                        disabled={busy}
                        className={`${adminField} mt-1`}
                        onChange={(event) => updateSlide(index, { heading: event.target.value })}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-navy">Subheading</span>
                      <input
                        type="text"
                        value={slide.lines[0]}
                        disabled={busy}
                        className={`${adminField} mt-1`}
                        onChange={(event) => updateSlide(index, { lines: [event.target.value, slide.lines[1]] })}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-navy">Supporting line</span>
                      <input
                        type="text"
                        value={slide.lines[1]}
                        disabled={busy}
                        className={`${adminField} mt-1`}
                        onChange={(event) => updateSlide(index, { lines: [slide.lines[0], event.target.value] })}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-navy">Button label</span>
                      <input
                        type="text"
                        value={slide.buttonLabel}
                        disabled={busy}
                        className={`${adminField} mt-1`}
                        onChange={(event) => updateSlide(index, { buttonLabel: event.target.value })}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-navy">Button link</span>
                      <input
                        type="text"
                        value={slide.buttonHref}
                        disabled={busy}
                        className={`${adminField} mt-1`}
                        onChange={(event) => updateSlide(index, { buttonHref: event.target.value })}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-navy">Image alt text</span>
                      <input
                        type="text"
                        value={slide.alt}
                        disabled={busy}
                        className={`${adminField} mt-1`}
                        onChange={(event) => updateSlide(index, { alt: event.target.value })}
                      />
                    </label>
                  </div>
                </div>
              </AccordionPanel>
            </section>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-navy/10 px-3 py-3">
        <p className={`text-xs ${adminMuted}`}>
          {hero.slides.length} slide{hero.slides.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          className={adminGhost}
          disabled={busy}
          onClick={() => {
            const slide = createHeroSlide();
            onChange({ ...hero, slides: [...hero.slides, slide] });
            setOpenId(slide.id);
          }}
        >
          Add slide
        </button>
      </div>
    </div>
  );
}
