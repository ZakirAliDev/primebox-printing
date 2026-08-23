"use client";

import { useState, type ReactNode } from "react";
import { adminGhost, adminPrimary } from "@/components/admin/ui";
import { normalizeHexColor, type ColorScheme } from "@/lib/color-scheme";

type RegionId = "brand" | "promo" | "header" | "hero" | "page" | "footer" | "button";

const REGIONS: {
  id: RegionId;
  label: string;
  fields: { key: keyof ColorScheme; label: string }[];
}[] = [
  {
    id: "brand",
    label: "Brand",
    fields: [
      { key: "primary", label: "Primary" },
      { key: "onPrimary", label: "On primary" },
      { key: "accent", label: "Accent" },
      { key: "onAccent", label: "On accent" },
    ],
  },
  {
    id: "promo",
    label: "Promo bar",
    fields: [
      { key: "headerBar", label: "Fill" },
      { key: "headerBarText", label: "Text" },
    ],
  },
  {
    id: "header",
    label: "Header",
    fields: [
      { key: "header", label: "Fill" },
      { key: "headerText", label: "Text" },
    ],
  },
  {
    id: "button",
    label: "Button",
    fields: [
      { key: "button", label: "Fill" },
      { key: "buttonText", label: "Text" },
    ],
  },
  {
    id: "hero",
    label: "Hero",
    fields: [
      { key: "hero", label: "Fill" },
      { key: "heroText", label: "Text" },
    ],
  },
  {
    id: "page",
    label: "Page",
    fields: [
      { key: "background", label: "Background" },
      { key: "surface", label: "Surface" },
      { key: "text", label: "Text" },
      { key: "muted", label: "Muted" },
      { key: "border", label: "Border" },
      { key: "link", label: "Link" },
      { key: "focus", label: "Focus" },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    fields: [
      { key: "footer", label: "Fill" },
      { key: "footerText", label: "Text" },
      { key: "footerMuted", label: "Muted" },
      { key: "footerLink", label: "Link" },
    ],
  },
];

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
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
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

function RegionPreview({ id, colors }: { id: RegionId; colors: ColorScheme }) {
  if (id === "brand") {
    return (
      <span className="flex items-center gap-1">
        {[colors.primary, colors.onPrimary, colors.accent, colors.onAccent].map((value, index) => (
          <span key={index} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: value }} />
        ))}
      </span>
    );
  }

  if (id === "promo") {
    return (
      <span
        className="rounded px-2 py-0.5 text-[10px] font-medium"
        style={{ background: colors.headerBar, color: colors.headerBarText }}
      >
        Promo offer
      </span>
    );
  }

  if (id === "header") {
    return (
      <span
        className="rounded px-2 py-0.5 text-[10px] font-medium"
        style={{ background: colors.header, color: colors.headerText }}
      >
        Prime Box
      </span>
    );
  }

  if (id === "button") {
    return (
      <span
        className="rounded px-2 py-0.5 text-[10px] font-semibold"
        style={{ background: colors.button, color: colors.buttonText }}
      >
        Get quote
      </span>
    );
  }

  if (id === "hero") {
    return (
      <span
        className="rounded px-2 py-0.5 text-[10px] font-medium"
        style={{ background: colors.hero, color: colors.heroText }}
      >
        Hero
      </span>
    );
  }

  if (id === "page") {
    return (
      <span
        className="rounded border px-2 py-0.5 text-[10px]"
        style={{ background: colors.surface, color: colors.text, borderColor: colors.border }}
      >
        <span style={{ color: colors.muted }}>Muted</span>
        {" · "}
        <span className="underline" style={{ color: colors.link }}>
          Link
        </span>
      </span>
    );
  }

  return (
    <span
      className="rounded px-2 py-0.5 text-[10px] font-medium"
      style={{ background: colors.footer, color: colors.footerText }}
    >
      <span>Footer</span>
      <span className="ml-1.5" style={{ color: colors.footerMuted }}>
        Muted
      </span>
    </span>
  );
}

export function ColorSchemeEditor({
  colors,
  busy,
  onChange,
  onSave,
  onReset,
}: {
  colors: ColorScheme;
  busy: boolean;
  onChange: (key: keyof ColorScheme, value: string) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  const [openId, setOpenId] = useState<RegionId | null>("brand");

  const paint = (key: keyof ColorScheme, value: string) => {
    onChange(key, normalizeHexColor(value, colors[key]));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-navy/10 bg-navy/[0.04] px-3 py-2">
        <h2 className="font-semibold text-navy">Color scheme</h2>
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
        {REGIONS.map((item) => {
          const open = openId === item.id;
          return (
            <section key={item.id}>
              <button
                type="button"
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-navy/[0.03]"
                onClick={() => setOpenId(open ? null : item.id)}
              >
                <span className="w-24 shrink-0 text-sm font-medium text-navy">{item.label}</span>
                <span className="min-w-0 flex-1">
                  <RegionPreview id={item.id} colors={colors} />
                </span>
                <Chevron open={open} />
              </button>
              <AccordionPanel open={open}>
                <ul className="grid grid-cols-[auto_auto_auto] items-center justify-start gap-x-1.5 gap-y-2 bg-navy/[0.03] px-3 py-3">
                  {item.fields.map((field) => (
                    <li key={field.key} className="contents">
                      <span className="text-xs text-navy">{field.label}</span>
                      <Swatch
                        value={colors[field.key]}
                        disabled={busy}
                        onChange={(value) => paint(field.key, value)}
                      />
                      <input
                        key={`${field.key}-${colors[field.key]}`}
                        type="text"
                        defaultValue={colors[field.key]}
                        disabled={busy}
                        spellCheck={false}
                        className="w-[4.75rem] rounded border border-navy/20 bg-white px-1.5 py-0.5 font-mono text-[10px] text-navy outline-none focus:border-navy"
                        onBlur={(event) => paint(field.key, event.target.value)}
                      />
                    </li>
                  ))}
                </ul>
              </AccordionPanel>
            </section>
          );
        })}
      </div>
    </div>
  );
}
