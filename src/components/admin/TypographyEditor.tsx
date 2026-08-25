"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { FontFamilyPicker } from "@/components/admin/FontFamilyPicker";
import { adminField, adminGhost, adminPrimary } from "@/components/admin/ui";
import { normalizeHexColor } from "@/lib/color-scheme";
import { canAddCustomFont, fontFamilyCss } from "@/lib/google-fonts";
import {
  SITE_FONT_SIZE_MAX,
  SITE_FONT_SIZE_MIN,
  SITE_LINE_HEIGHT_MAX,
  SITE_LINE_HEIGHT_MIN,
  SITE_TEXT_ROLE_LABELS,
  SITE_TEXT_ROLES,
  type CardTextSizes,
  type SiteTextRole,
  type SiteTextStyle,
  type SiteTypographySettings,
} from "@/lib/site-typography";

function clampDraftNumber(raw: string, fallback: number, min: number, max: number, decimals = 0) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const clamped = Math.min(max, Math.max(min, parsed));
  if (decimals <= 0) {
    return Math.round(clamped);
  }
  return Number(clamped.toFixed(decimals));
}

function NumberDraftInput({
  value,
  min,
  max,
  decimals = 0,
  disabled,
  className,
  ariaLabel,
  name,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  decimals?: number;
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
    const next = clampDraftNumber(node.value, committed.current, min, max, decimals);
    committed.current = next;
    node.value = String(next);
    onChange(next);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
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
        const cleaned = node.value.replace(decimals > 0 ? /[^\d.]/g : /\D/g, "");
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

function Swatch({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-md border border-navy/20 shadow-sm">
      <span className="absolute inset-0" style={{ background: value }} />
      <input
        type="color"
        value={value}
        disabled={disabled}
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
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

function RolePreview({ role, style }: { role: SiteTextRole; style: SiteTextStyle }) {
  const sample = role === "paragraph" ? "Body text sample" : "Heading sample";
  return (
    <span
      className="block truncate text-navy"
      style={{
        fontFamily: fontFamilyCss(style.fontFamily),
        fontSize: Math.min(18, Math.max(12, style.fontSize * 0.45)),
        lineHeight: style.lineHeight,
        color: style.color,
        fontWeight: role === "paragraph" ? 400 : 600,
      }}
    >
      {sample}
    </span>
  );
}

export function TypographyEditor({
  typography,
  busy,
  onChange,
  onSave,
  onReset,
}: {
  typography: SiteTypographySettings;
  busy: boolean;
  onChange: (next: SiteTypographySettings) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  const [openId, setOpenId] = useState<SiteTextRole | "productCard" | "categoryCard" | null>("h1");
  const extras = typography.customFonts;

  const patchRole = (role: SiteTextRole, value: SiteTextStyle) => {
    const nextFonts = canAddCustomFont(value.fontFamily, extras)
      ? [...extras, value.fontFamily]
      : extras;
    onChange({
      ...typography,
      customFonts: nextFonts,
      [role]: value,
    });
  };

  const patchCard = (key: "productCard" | "categoryCard", value: CardTextSizes) => {
    onChange({ ...typography, [key]: value });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-navy/10 bg-navy/[0.04] px-3 py-2">
        <div>
          <h2 className="font-semibold text-navy">Typography</h2>
          <p className="text-xs text-navy/55">Headings and paragraph styles for the whole storefront.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className={adminGhost} disabled={busy} onClick={onReset}>
            Reset
          </button>
          <button type="button" className={adminPrimary} disabled={busy} onClick={onSave}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="divide-y divide-navy/10">
        {SITE_TEXT_ROLES.map((role) => {
          const open = openId === role;
          const style = typography[role];
          return (
            <section key={role}>
              <button
                type="button"
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-navy/[0.03]"
                onClick={() => setOpenId(open ? null : role)}
              >
                <span className="w-28 shrink-0 text-sm font-medium text-navy">
                  {SITE_TEXT_ROLE_LABELS[role]}
                </span>
                <span className="min-w-0 flex-1">
                  <RolePreview role={role} style={style} />
                </span>
                <Chevron open={open} />
              </button>
              <AccordionPanel open={open}>
                <div className="bg-navy/[0.03] px-3 py-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_5.75rem_4.75rem_auto] items-end gap-x-2 gap-y-2">
                    <div className="min-w-0">
                      <span className="mb-1 block text-xs text-navy/55">Font family</span>
                      <FontFamilyPicker
                        compact
                        value={style.fontFamily}
                        extras={extras}
                        disabled={busy}
                        onChange={(fontFamily) => patchRole(role, { ...style, fontFamily })}
                        onAdd={(fontFamily) =>
                          onChange({
                            ...typography,
                            customFonts: canAddCustomFont(fontFamily, extras)
                              ? [...extras, fontFamily]
                              : extras,
                            [role]: { ...style, fontFamily },
                          })
                        }
                      />
                    </div>
                    <div>
                      <span className="mb-1 block text-xs text-navy/55">Size</span>
                      <label
                        className={`${adminField} flex h-[38px] max-h-[38px] items-center gap-1 px-2 py-0`}
                      >
                        <NumberDraftInput
                          name={`site-type-size-${role}`}
                          value={style.fontSize}
                          min={SITE_FONT_SIZE_MIN}
                          max={SITE_FONT_SIZE_MAX}
                          disabled={busy}
                          ariaLabel={`${SITE_TEXT_ROLE_LABELS[role]} font size`}
                          className="h-full min-w-0 flex-1 bg-transparent text-sm leading-none text-navy outline-none"
                          onChange={(fontSize) => patchRole(role, { ...style, fontSize })}
                        />
                        <span className="shrink-0 text-xs text-navy/55">px</span>
                      </label>
                    </div>
                    <div>
                      <span className="mb-1 block text-xs text-navy/55">Line height</span>
                      <label
                        className={`${adminField} flex h-[38px] max-h-[38px] items-center gap-1 px-2 py-0`}
                      >
                        <NumberDraftInput
                          name={`site-type-lh-${role}`}
                          value={style.lineHeight}
                          min={SITE_LINE_HEIGHT_MIN}
                          max={SITE_LINE_HEIGHT_MAX}
                          decimals={2}
                          disabled={busy}
                          ariaLabel={`${SITE_TEXT_ROLE_LABELS[role]} line height`}
                          className="h-full min-w-0 flex-1 bg-transparent text-sm leading-none text-navy outline-none"
                          onChange={(lineHeight) => patchRole(role, { ...style, lineHeight })}
                        />
                      </label>
                    </div>
                    <div>
                      <span className="mb-1 block text-xs text-navy/55">Color</span>
                      <div className="flex h-[38px] items-center gap-1.5">
                        <Swatch
                          value={style.color}
                          disabled={busy}
                          onChange={(color) =>
                            patchRole(role, {
                              ...style,
                              color: normalizeHexColor(color, style.color),
                            })
                          }
                        />
                        <input
                          key={`${role}-${style.color}`}
                          type="text"
                          defaultValue={style.color}
                          disabled={busy}
                          spellCheck={false}
                          aria-label={`${SITE_TEXT_ROLE_LABELS[role]} color`}
                          className={`${adminField} w-[5.5rem] py-1 font-mono text-xs uppercase`}
                          onBlur={(event) =>
                            patchRole(role, {
                              ...style,
                              color: normalizeHexColor(event.currentTarget.value, style.color),
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionPanel>
            </section>
          );
        })}

        {(
          [
            {
              id: "productCard" as const,
              label: "Product card",
              sizes: typography.productCard,
              hint: "Overrides global heading/paragraph sizes on product cards.",
            },
            {
              id: "categoryCard" as const,
              label: "Category card",
              sizes: typography.categoryCard,
              hint: "Overrides global heading/paragraph sizes on category cards.",
            },
          ] as const
        ).map((card) => {
          const open = openId === card.id;
          return (
            <section key={card.id}>
              <button
                type="button"
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-navy/[0.03]"
                onClick={() => setOpenId(open ? null : card.id)}
              >
                <span className="w-28 shrink-0 text-sm font-medium text-navy">{card.label}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-navy/55">
                  Title {card.sizes.title}px · Body {card.sizes.body}px
                </span>
                <Chevron open={open} />
              </button>
              <AccordionPanel open={open}>
                <div className="space-y-3 bg-navy/[0.03] px-3 py-3">
                  <p className="text-xs text-navy/55">{card.hint}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="mb-1 block text-xs text-navy/55">Title size</span>
                      <label
                        className={`${adminField} flex h-[38px] max-h-[38px] items-center gap-1 px-2 py-0`}
                      >
                        <NumberDraftInput
                          name={`site-type-${card.id}-title`}
                          value={card.sizes.title}
                          min={SITE_FONT_SIZE_MIN}
                          max={SITE_FONT_SIZE_MAX}
                          disabled={busy}
                          ariaLabel={`${card.label} title font size`}
                          className="h-full min-w-0 flex-1 bg-transparent text-sm leading-none text-navy outline-none"
                          onChange={(title) => patchCard(card.id, { ...card.sizes, title })}
                        />
                        <span className="shrink-0 text-xs text-navy/55">px</span>
                      </label>
                    </div>
                    <div>
                      <span className="mb-1 block text-xs text-navy/55">Body size</span>
                      <label
                        className={`${adminField} flex h-[38px] max-h-[38px] items-center gap-1 px-2 py-0`}
                      >
                        <NumberDraftInput
                          name={`site-type-${card.id}-body`}
                          value={card.sizes.body}
                          min={SITE_FONT_SIZE_MIN}
                          max={SITE_FONT_SIZE_MAX}
                          disabled={busy}
                          ariaLabel={`${card.label} body font size`}
                          className="h-full min-w-0 flex-1 bg-transparent text-sm leading-none text-navy outline-none"
                          onChange={(body) => patchCard(card.id, { ...card.sizes, body })}
                        />
                        <span className="shrink-0 text-xs text-navy/55">px</span>
                      </label>
                    </div>
                  </div>
                </div>
              </AccordionPanel>
            </section>
          );
        })}
      </div>
    </div>
  );
}
