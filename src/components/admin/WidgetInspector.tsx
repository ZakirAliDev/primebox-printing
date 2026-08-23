"use client";

import { useEffect, useRef, useState } from "react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { TemplateIcon } from "@/components/TemplateIcons";
import { adminField, adminGhost, adminMuted, adminTrash } from "@/components/admin/ui";
import { FontFamilyPicker } from "@/components/admin/FontFamilyPicker";
import {
  BORDER_STYLES,
  BUTTON_STYLES,
  FONT_SIZE_UNITS,
  FONT_STYLES,
  FONT_WEIGHTS,
  GRID_BREAKPOINTS,
  HEADING_TAGS,
  ICON_NAMES,
  IMAGE_OBJECT_FITS,
  IMAGE_OBJECT_POSITIONS,
  IMAGE_SIZE_MODES,
  LINE_HEIGHT_UNITS,
  SIZE_UNITS,
  SPACING_UNITS,
  TEXT_DECORATIONS,
  TEXT_TRANSFORMS,
  WIDGET_ALIGNS,
  defaultGridSize,
  ensureGridCells,
  gridCellCount,
  resetAppearance,
  resolvedAppearance,
  resolvedGridSize,
  setAppearance,
  type BorderStyle,
  type FontSizeUnit,
  type FontStyle,
  type FontWeight,
  type GridBreakpointId,
  type LengthValue,
  type LineHeightUnit,
  type SizeUnit,
  type SpacingUnit,
  type TemplateWidget,
  type TextDecoration,
  type TextTransform,
  type WidgetAlign,
  type WidgetAppearance,
  type WidgetSpacing,
  type WidgetTypography,
} from "@/lib/template-layout";

type InspectorTab = "content" | "style" | "advanced";

const TYPOGRAPHY_WIDGET_TYPES = new Set<TemplateWidget["type"]>([
  "heading",
  "text",
  "button",
  "icon",
  "spec-list",
]);

function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isHexColor(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function titleCase(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

function AccordionPanel({
  open,
  bodyClassName,
  children,
}: {
  open: boolean;
  bodyClassName: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden" {...(!open ? { inert: true } : {})}>
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  );
}

function AccordionChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-3 w-3 shrink-0 text-navy/45 transition-transform duration-300 ease-in-out ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden
    >
      <path fill="currentColor" d="M2.2 4.2a.75.75 0 0 1 1.06 0L6 6.94l2.74-2.74a.75.75 0 1 1 1.06 1.06L6.53 8.53a.75.75 0 0 1-1.06 0L2.2 5.26a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

const inspectorField =
  "h-7 min-w-0 rounded-[3px] border border-navy/20 bg-white px-2 text-[11px] text-navy outline-none focus:border-navy";
const inspectorControl = `${inspectorField} w-full`;
const inspectorNumber =
  `${inspectorField} w-[4.75rem] shrink-0 px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

const FONT_WEIGHT_LABELS: Record<string, string> = {
  "": "Default",
  "100": "100 (Thin)",
  "200": "200 (Extra Light)",
  "300": "300 (Light)",
  "400": "400 (Normal)",
  "500": "500 (Medium)",
  "600": "600 (Semi Bold)",
  "700": "700 (Bold)",
  "800": "800 (Extra Bold)",
  "900": "900 (Black)",
};

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-3 py-1.5">
      <span className="shrink-0 whitespace-nowrap text-[11px] text-navy/70">{label}</span>
      <div className="flex min-w-0 flex-1 items-center justify-end">{children}</div>
    </div>
  );
}

function AlignButtons({
  value,
  onChange,
}: {
  value: WidgetAlign;
  onChange: (align: WidgetAlign) => void;
}) {
  const icons: Record<WidgetAlign, string> = {
    left: "M3 5h14M3 9h9M3 13h14M3 17h9",
    center: "M3 5h14M6 9h8M3 13h14M6 17h8",
    right: "M3 5h14M8 9h9M3 13h14M8 17h9",
  };
  return (
    <div className="inline-flex overflow-hidden rounded-[3px] border border-navy/20">
      {WIDGET_ALIGNS.map((align) => (
        <button
          key={align}
          type="button"
          aria-label={align}
          className={`flex h-7 w-7 items-center justify-center ${
            value === align ? "bg-navy/10 text-navy" : "bg-white text-navy/35 hover:text-navy/70"
          }`}
          onClick={() => onChange(align)}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" d={icons[align]} />
          </svg>
        </button>
      ))}
    </div>
  );
}

function InspectorGroup({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-navy/10">
      <button
        type="button"
        className="flex w-full items-center justify-between bg-navy/[0.04] px-2.5 py-2 text-left text-xs font-semibold text-navy"
        aria-expanded={open}
        onClick={onToggle}
      >
        {title}
        <AccordionChevron open={open} />
      </button>
      <AccordionPanel open={open} bodyClassName="divide-y divide-navy/10 px-2.5">
        {children}
      </AccordionPanel>
    </div>
  );
}

export function WidgetInspector({
  widget,
  mediaSlug,
  previewBreakpoint,
  onPreviewBreakpoint,
  onChange,
  onRemove,
}: {
  widget: TemplateWidget | null;
  mediaSlug: string;
  previewBreakpoint: GridBreakpointId;
  onPreviewBreakpoint: (id: GridBreakpointId) => void;
  onChange: (widget: TemplateWidget) => void;
  onRemove: () => void;
}) {
  const [tab, setTab] = useState<InspectorTab>("content");

  useEffect(() => {
    setTab("content");
  }, [widget?.id]);

  if (!widget) {
    return (
      <div className="p-3">
        <p className={`text-xs ${adminMuted}`}>Click or drag a widget onto a column, then select it to edit.</p>
      </div>
    );
  }

  const current = resolvedAppearance(widget.appearance, previewBreakpoint);
  const patch = (partial: Partial<WidgetAppearance>) =>
    onChange({ ...widget, appearance: setAppearance(widget.appearance, previewBreakpoint, partial) });

  const tabs: { id: InspectorTab; label: string }[] = [
    { id: "content", label: "Content" },
    { id: "style", label: "Style" },
    { id: "advanced", label: "Advanced" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-2 border-b border-navy/10 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">
          {widget.type === "text" ? "Text editor" : widget.type.replace("-", " ")}
        </p>
        <button type="button" className={`${adminTrash} text-xs`} onClick={onRemove}>
          Delete
        </button>
      </div>
      <div className="border-b border-navy/10 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          {GRID_BREAKPOINTS.map((breakpoint) => (
            <button
              key={breakpoint.id}
              type="button"
              className={`rounded border px-1.5 py-1 text-[10px] font-semibold ${
                previewBreakpoint === breakpoint.id
                  ? "border-yellow bg-yellow/20 text-navy"
                  : "border-navy/15 bg-white text-navy/60"
              }`}
              onClick={() => onPreviewBreakpoint(breakpoint.id)}
            >
              {breakpoint.short}
            </button>
          ))}
        </div>
        {previewBreakpoint !== "lg" && !widget.appearance[previewBreakpoint] ? (
          <p className={`mt-1 text-[10px] ${adminMuted}`}>Inheriting from a larger screen</p>
        ) : null}
        {previewBreakpoint === "lg" ? (
          <button
            type="button"
            className={`${adminGhost} mt-2 text-xs`}
            onClick={() => onChange({ ...widget, appearance: resetAppearance(widget.appearance, "lg") })}
          >
            Reset to defaults
          </button>
        ) : widget.appearance[previewBreakpoint] ? (
          <button
            type="button"
            className={`${adminGhost} mt-2 text-xs`}
            onClick={() =>
              onChange({ ...widget, appearance: resetAppearance(widget.appearance, previewBreakpoint) })
            }
          >
            Reset this screen size
          </button>
        ) : null}
      </div>
      <div className="flex border-b border-navy/10">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`flex-1 px-2 py-2 text-xs font-semibold ${
              tab === item.id ? "border-b-2 border-yellow text-navy" : "text-navy/50 hover:text-navy"
            }`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="space-y-2 p-3">
        {tab === "content" ? (
          <ContentFields
            widget={widget}
            appearance={current}
            mediaSlug={mediaSlug}
            previewBreakpoint={previewBreakpoint}
            onChange={onChange}
            onAppearance={patch}
          />
        ) : null}
        {tab === "style" ? <StyleFields widget={widget} appearance={current} onAppearance={patch} /> : null}
        {tab === "advanced" ? <AdvancedFields appearance={current} onChange={patch} /> : null}
      </div>
    </div>
  );
}

function ContentFields({
  widget,
  appearance,
  mediaSlug,
  previewBreakpoint,
  onChange,
  onAppearance,
}: {
  widget: TemplateWidget;
  appearance: WidgetAppearance;
  mediaSlug: string;
  previewBreakpoint: GridBreakpointId;
  onChange: (widget: TemplateWidget) => void;
  onAppearance: (partial: Partial<WidgetAppearance>) => void;
}) {
  if (widget.type === "heading") {
    return (
      <div className="divide-y divide-navy/10">
        <label className="block py-1.5">
          <span className="mb-1.5 block text-[11px] text-navy/70">Text</span>
          <textarea
            rows={6}
            value={widget.text}
            className="min-h-[8.25rem] w-full resize-y rounded-[3px] border border-navy/20 bg-white px-2 py-1.5 text-[11px] leading-5 text-navy outline-none focus:border-navy"
            onChange={(event) => onChange({ ...widget, text: event.target.value })}
          />
        </label>
        <SettingRow label="HTML tag">
          <select
            value={widget.tag}
            className={inspectorControl}
            onChange={(event) => onChange({ ...widget, tag: event.target.value as (typeof HEADING_TAGS)[number] })}
          >
            {HEADING_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag.toUpperCase()}
              </option>
            ))}
          </select>
        </SettingRow>
      </div>
    );
  }
  if (widget.type === "text") {
    return (
      <RichTextEditor
        key={widget.id}
        defaultValue={widget.html}
        height={460}
        compact
        mediaSlug={mediaSlug}
        onHtmlChange={(html) => onChange({ ...widget, html })}
      />
    );
  }
  if (widget.type === "image") {
    return <ImageFields widget={widget} appearance={appearance} mediaSlug={mediaSlug} onChange={onChange} onAppearance={onAppearance} />;
  }
  if (widget.type === "button") {
    return (
      <div className="divide-y divide-navy/10">
        <SettingRow label="Label">
          <input
            value={widget.label}
            className={inspectorControl}
            onChange={(event) => onChange({ ...widget, label: event.target.value })}
          />
        </SettingRow>
        <SettingRow label="Link">
          <input
            value={widget.href}
            className={inspectorControl}
            onChange={(event) => onChange({ ...widget, href: event.target.value })}
          />
        </SettingRow>
        <SettingRow label="Style">
          <select
            value={appearance.buttonStyle}
            className={inspectorControl}
            onChange={(event) =>
              onAppearance({ buttonStyle: event.target.value as (typeof BUTTON_STYLES)[number] })
            }
          >
            {BUTTON_STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </SettingRow>
      </div>
    );
  }
  if (widget.type === "icon") {
    return (
      <>
        <div>
          <span className={`mb-1 block text-xs ${adminMuted}`}>Icon</span>
          <div className="grid grid-cols-5 gap-1">
            {ICON_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                className={`flex h-9 items-center justify-center rounded border ${
                  widget.name === name ? "border-yellow bg-yellow/20" : "border-navy/15"
                }`}
                onClick={() => onChange({ ...widget, name })}
              >
                <TemplateIcon name={name} />
              </button>
            ))}
          </div>
        </div>
        <SettingRow label="Label">
          <input
            value={widget.label}
            className={inspectorControl}
            onChange={(event) => onChange({ ...widget, label: event.target.value })}
          />
        </SettingRow>
      </>
    );
  }
  if (widget.type === "spacer") {
    return (
      <div className="divide-y divide-navy/10">
        <div className="py-1.5">
          <span className="text-[11px] text-navy/70">Height</span>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              type="range"
              min={8}
              max={160}
              value={appearance.spacerHeight}
              className="inspector-range"
              onChange={(event) => onAppearance({ spacerHeight: Number(event.target.value) })}
            />
            <input
              type="number"
              min={8}
              max={160}
              value={appearance.spacerHeight}
              className={inspectorNumber}
              onChange={(event) => onAppearance({ spacerHeight: clampValue(Number(event.target.value) || 8, 8, 160) })}
            />
          </div>
        </div>
        <SettingRow label="Divider">
          <input
            type="checkbox"
            className="h-4 w-4 accent-navy"
            checked={appearance.divider}
            onChange={(event) => onAppearance({ divider: event.target.checked })}
          />
        </SettingRow>
      </div>
    );
  }
  if (widget.type === "grid") {
    return (
      <GridFields widget={widget} previewBreakpoint={previewBreakpoint} onChange={onChange} />
    );
  }
  return (
    <div className="space-y-2">
      {widget.rows.map((row, index) => (
        <div key={`${widget.id}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-1">
          <input
            value={row.label}
            placeholder="Label"
            className={adminField}
            onChange={(event) => {
              const rows = widget.rows.map((item, rowIndex) =>
                rowIndex === index ? { ...item, label: event.target.value } : item,
              );
              onChange({ ...widget, rows });
            }}
          />
          <input
            value={row.value}
            placeholder="Value"
            className={adminField}
            onChange={(event) => {
              const rows = widget.rows.map((item, rowIndex) =>
                rowIndex === index ? { ...item, value: event.target.value } : item,
              );
              onChange({ ...widget, rows });
            }}
          />
          <button
            type="button"
            className={`${adminTrash} px-1 text-xs`}
            onClick={() =>
              onChange({
                ...widget,
                rows: widget.rows.filter((_, rowIndex) => rowIndex !== index),
              })
            }
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className={adminGhost}
        onClick={() => onChange({ ...widget, rows: [...widget.rows, { label: "", value: "" }] })}
      >
        + Row
      </button>
    </div>
  );
}

function GridFields({
  widget,
  previewBreakpoint,
  onChange,
}: {
  widget: Extract<TemplateWidget, { type: "grid" }>;
  previewBreakpoint: GridBreakpointId;
  onChange: (widget: TemplateWidget) => void;
}) {
  const current = resolvedGridSize(widget.sizes, previewBreakpoint);

  const setSize = (patch: Partial<typeof current>) => {
    let sizes = { ...widget.sizes };
    if (previewBreakpoint === "base" && sizes.lg) {
      if (!sizes.md) {
        sizes.md = resolvedGridSize(sizes, "md");
      }
      if (!sizes.sm) {
        sizes.sm = resolvedGridSize(sizes, "sm");
      }
    }
    const nextSize = { ...resolvedGridSize(sizes, previewBreakpoint), ...patch };
    sizes = { ...sizes, [previewBreakpoint]: nextSize };
    onChange({
      ...widget,
      sizes,
      cells: ensureGridCells(widget.cells, gridCellCount(sizes)),
    });
  };

  const resetGrid = () => {
    const sizes = { ...widget.sizes };
    if (previewBreakpoint === "lg") {
      onChange({
        ...widget,
        sizes: { lg: defaultGridSize() },
        cells: ensureGridCells(widget.cells, gridCellCount({ lg: defaultGridSize() })),
      });
      return;
    }
    delete sizes[previewBreakpoint];
    onChange({
      ...widget,
      sizes,
      cells: ensureGridCells(widget.cells, gridCellCount(sizes)),
    });
  };

  return (
    <div className="divide-y divide-navy/10">
      <ClampedNumberField
        label="Columns"
        value={current.columns}
        min={1}
        max={12}
        onChange={(columns) => setSize({ columns })}
      />
      <ClampedNumberField
        label="Rows"
        value={current.rows}
        min={1}
        max={12}
        onChange={(rows) => setSize({ rows })}
      />
      <ClampedNumberField
        label="Gap"
        value={current.gap}
        min={0}
        max={64}
        onChange={(gap) => setSize({ gap })}
      />
      {previewBreakpoint === "lg" || widget.sizes[previewBreakpoint] ? (
        <div className="py-2">
          <button type="button" className={adminGhost} onClick={resetGrid}>
            Reset grid for this screen size
          </button>
        </div>
      ) : null}
      <p className={`py-2 text-[10px] ${adminMuted}`}>
        Drop heading, text, image, and other widgets into the grid cells on the canvas. Nested grids are not allowed.
      </p>
    </div>
  );
}

function StyleFields({
  widget,
  appearance,
  onAppearance,
}: {
  widget: TemplateWidget;
  appearance: WidgetAppearance;
  onAppearance: (partial: Partial<WidgetAppearance>) => void;
}) {
  const hasTypography = TYPOGRAPHY_WIDGET_TYPES.has(widget.type);
  const [openGroup, setOpenGroup] = useState(hasTypography ? "typography" : "layout");

  useEffect(() => {
    setOpenGroup(TYPOGRAPHY_WIDGET_TYPES.has(widget.type) ? "typography" : "layout");
  }, [widget.id, widget.type]);

  const toggle = (id: string) => setOpenGroup((current) => (current === id ? "" : id));

  return (
    <>
      {hasTypography ? (
        <InspectorGroup title="Typography" open={openGroup === "typography"} onToggle={() => toggle("typography")}>
          <TypographyFields key={widget.id} appearance={appearance} onAppearance={onAppearance} />
        </InspectorGroup>
      ) : null}
      <InspectorGroup title="Layout & colors" open={openGroup === "layout"} onToggle={() => toggle("layout")}>
        <SettingRow label="Alignment">
          <AlignButtons value={appearance.align} onChange={(align) => onAppearance({ align })} />
        </SettingRow>
        <ColorField
          label="Text color"
          value={appearance.color}
          fallback="#12315a"
          onChange={(color) => onAppearance({ color })}
        />
        <ColorField
          label="Background"
          value={appearance.background}
          fallback="#ffffff"
          onChange={(background) => onAppearance({ background })}
        />
      </InspectorGroup>
      {widget.type === "image" ? (
        <InspectorGroup title="Image" open={openGroup === "image"} onToggle={() => toggle("image")}>
          <SettingRow label="Object fit">
            <select
              value={appearance.objectFit}
              className={inspectorControl}
              onChange={(event) =>
                onAppearance({ objectFit: event.target.value as (typeof IMAGE_OBJECT_FITS)[number] })
              }
            >
              {IMAGE_OBJECT_FITS.map((fit) => (
                <option key={fit} value={fit}>
                  {fit === "scale-down" ? "Scale down" : fit[0].toUpperCase() + fit.slice(1)}
                </option>
              ))}
            </select>
          </SettingRow>
          <SettingRow label="Position">
            <select
              value={appearance.objectPosition}
              className={inspectorControl}
              onChange={(event) =>
                onAppearance({
                  objectPosition: event.target.value as (typeof IMAGE_OBJECT_POSITIONS)[number],
                })
              }
            >
              {IMAGE_OBJECT_POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position[0].toUpperCase() + position.slice(1)}
                </option>
              ))}
            </select>
          </SettingRow>
        </InspectorGroup>
      ) : null}
      <InspectorGroup title="Border" open={openGroup === "border"} onToggle={() => toggle("border")}>
        <BorderFields appearance={appearance} onAppearance={onAppearance} />
      </InspectorGroup>
      <InspectorGroup title="Box shadow" open={openGroup === "shadow"} onToggle={() => toggle("shadow")}>
        <ShadowFields appearance={appearance} onAppearance={onAppearance} />
      </InspectorGroup>
    </>
  );
}

function optionLabel(value: string) {
  if (!value || value === "none" || value === "normal") {
    return "Default";
  }
  if (value === "line-through") {
    return "Line Through";
  }
  return titleCase(value);
}

function TypographyFields({
  appearance,
  onAppearance,
}: {
  appearance: WidgetAppearance;
  onAppearance: (partial: Partial<WidgetAppearance>) => void;
}) {
  const typography = appearance.typography;
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const selectedFamily = typography.fontFamily;

  const patchTypography = (patch: Partial<WidgetTypography>) =>
    onAppearance({ typography: { ...typography, ...patch } });

  return (
    <>
      <SettingRow label="Family">
        <FontFamilyPicker
          compact
          value={selectedFamily}
          extras={customFonts}
          onChange={(fontFamily) => patchTypography({ fontFamily })}
          onAdd={(family) => setCustomFonts((current) => [...current, family])}
        />
      </SettingRow>
      <LengthValueField
        compact
        label="Size"
        value={typography.fontSize}
        units={FONT_SIZE_UNITS}
        defaultUnit="px"
        rangeFor={() => ({ min: 8, max: 200 })}
        stepFor={(unit) => (unit === "px" ? 1 : 0.1)}
        onChange={(fontSize) => patchTypography({ fontSize: fontSize as LengthValue<FontSizeUnit> | null })}
      />
      <SettingRow label="Weight">
        <select
          value={typography.fontWeight}
          className={inspectorControl}
          onChange={(event) => patchTypography({ fontWeight: event.target.value as FontWeight })}
        >
          {FONT_WEIGHTS.map((weight) => (
            <option key={weight || "default"} value={weight}>
              {FONT_WEIGHT_LABELS[weight] ?? weight}
            </option>
          ))}
        </select>
      </SettingRow>
      <SettingRow label="Transform">
        <select
          value={typography.textTransform}
          className={inspectorControl}
          onChange={(event) => patchTypography({ textTransform: event.target.value as TextTransform })}
        >
          {TEXT_TRANSFORMS.map((transform) => (
            <option key={transform} value={transform}>
              {optionLabel(transform)}
            </option>
          ))}
        </select>
      </SettingRow>
      <SettingRow label="Style">
        <select
          value={typography.fontStyle}
          className={inspectorControl}
          onChange={(event) => patchTypography({ fontStyle: event.target.value as FontStyle })}
        >
          {FONT_STYLES.map((style) => (
            <option key={style} value={style}>
              {optionLabel(style)}
            </option>
          ))}
        </select>
      </SettingRow>
      <SettingRow label="Decoration">
        <select
          value={typography.textDecoration}
          className={inspectorControl}
          onChange={(event) => patchTypography({ textDecoration: event.target.value as TextDecoration })}
        >
          {TEXT_DECORATIONS.map((decoration) => (
            <option key={decoration} value={decoration}>
              {optionLabel(decoration)}
            </option>
          ))}
        </select>
      </SettingRow>
      <LengthValueField
        compact
        label="Line Height"
        value={typography.lineHeight}
        units={LINE_HEIGHT_UNITS}
        defaultUnit=""
        unitLabel={(unit) => (unit === "" ? "—" : unit)}
        rangeFor={(unit) => (unit === "" ? { min: 0.8, max: 3 } : { min: 8, max: 200 })}
        stepFor={(unit) => (unit === "" ? 0.1 : 1)}
        onChange={(lineHeight) =>
          patchTypography({ lineHeight: lineHeight as LengthValue<LineHeightUnit> | null })
        }
      />
      <LengthValueField
        compact
        label="Letter Spacing"
        value={typography.letterSpacing}
        units={SPACING_UNITS}
        defaultUnit="px"
        rangeFor={() => ({ min: -20, max: 40 })}
        stepFor={(unit) => (unit === "px" ? 1 : 0.1)}
        onChange={(letterSpacing) =>
          patchTypography({ letterSpacing: letterSpacing as LengthValue<SpacingUnit> | null })
        }
      />
      <LengthValueField
        compact
        label="Word Spacing"
        value={typography.wordSpacing}
        units={SPACING_UNITS}
        defaultUnit="px"
        rangeFor={() => ({ min: -20, max: 40 })}
        stepFor={(unit) => (unit === "px" ? 1 : 0.1)}
        onChange={(wordSpacing) =>
          patchTypography({ wordSpacing: wordSpacing as LengthValue<SpacingUnit> | null })
        }
      />
    </>
  );
}

function BorderFields({
  appearance,
  onAppearance,
}: {
  appearance: WidgetAppearance;
  onAppearance: (partial: Partial<WidgetAppearance>) => void;
}) {
  const border = appearance.border;
  return (
    <>
      <ClampedNumberField
        label="Width"
        value={border.width}
        min={0}
        max={40}
        onChange={(width) => onAppearance({ border: { ...border, width } })}
      />
      <SettingRow label="Style">
        <select
          value={border.style}
          className={inspectorControl}
          onChange={(event) =>
            onAppearance({ border: { ...border, style: event.target.value as BorderStyle } })
          }
        >
          {BORDER_STYLES.map((style) => (
            <option key={style} value={style}>
              {titleCase(style)}
            </option>
          ))}
        </select>
      </SettingRow>
      <ColorField
        label="Color"
        value={border.color}
        fallback="#12315a"
        onChange={(color) => onAppearance({ border: { ...border, color } })}
      />
      <ClampedNumberField
        label="Radius"
        value={border.radius}
        min={0}
        max={80}
        onChange={(radius) => onAppearance({ border: { ...border, radius } })}
      />
    </>
  );
}

function ShadowFields({
  appearance,
  onAppearance,
}: {
  appearance: WidgetAppearance;
  onAppearance: (partial: Partial<WidgetAppearance>) => void;
}) {
  const shadow = appearance.shadow;
  return (
    <>
      <SettingRow label="Enabled">
        <input
          type="checkbox"
          className="h-4 w-4 accent-navy"
          checked={shadow.enabled}
          onChange={(event) => onAppearance({ shadow: { ...shadow, enabled: event.target.checked } })}
        />
      </SettingRow>
      <ClampedNumberField
        label="Horizontal"
        value={shadow.x}
        min={0}
        max={80}
        onChange={(x) => onAppearance({ shadow: { ...shadow, x } })}
      />
      <ClampedNumberField
        label="Vertical"
        value={shadow.y}
        min={0}
        max={80}
        onChange={(y) => onAppearance({ shadow: { ...shadow, y } })}
      />
      <ClampedNumberField
        label="Blur"
        value={shadow.blur}
        min={0}
        max={80}
        onChange={(blur) => onAppearance({ shadow: { ...shadow, blur } })}
      />
      <ClampedNumberField
        label="Spread"
        value={shadow.spread}
        min={0}
        max={80}
        onChange={(spread) => onAppearance({ shadow: { ...shadow, spread } })}
      />
      <ColorField
        label="Color"
        value={shadow.color}
        fallback="#000000"
        onChange={(color) => onAppearance({ shadow: { ...shadow, color } })}
      />
      <SettingRow label="Inset">
        <input
          type="checkbox"
          className="h-4 w-4 accent-navy"
          checked={shadow.inset}
          onChange={(event) => onAppearance({ shadow: { ...shadow, inset: event.target.checked } })}
        />
      </SettingRow>
    </>
  );
}

function LengthValueField({
  label,
  value,
  units,
  defaultUnit,
  unitLabel,
  rangeFor,
  stepFor,
  compact,
  onChange,
}: {
  label: string;
  value: { value: number; unit: string } | null;
  units: readonly string[];
  defaultUnit: string;
  unitLabel?: (unit: string) => string;
  rangeFor: (unit: string) => { min: number; max: number };
  stepFor?: (unit: string) => number;
  compact?: boolean;
  onChange: (next: { value: number; unit: string } | null) => void;
}) {
  const [emptyUnit, setEmptyUnit] = useState(value?.unit ?? defaultUnit);
  const unit = value?.unit ?? emptyUnit;
  const range = rangeFor(unit);
  const step = stepFor?.(unit) ?? 1;

  useEffect(() => {
    if (value) {
      setEmptyUnit(value.unit);
    }
  }, [value]);

  const setNumeric = (next: number) => {
    onChange({ value: clampValue(next, range.min, range.max), unit });
  };

  const unitSelect = (
    <select
      value={unit}
      className={`${inspectorField} w-12 shrink-0 px-1`}
      onChange={(event) => {
        const nextUnit = event.target.value;
        setEmptyUnit(nextUnit);
        if (!value) {
          return;
        }
        const nextRange = rangeFor(nextUnit);
        onChange({
          value: clampValue(value.value, nextRange.min, nextRange.max),
          unit: nextUnit,
        });
      }}
    >
      {units.map((item) => (
        <option key={item || "unitless"} value={item}>
          {unitLabel ? unitLabel(item) : item}
        </option>
      ))}
    </select>
  );

  const numberInput = (
    <input
      type="number"
      min={range.min}
      max={range.max}
      step={step}
      value={value?.value ?? ""}
      className={`${inspectorField} min-w-0 flex-1 px-1 text-center`}
      onChange={(event) => {
        if (event.target.value === "") {
          onChange(null);
          return;
        }
        const next = Number(event.target.value);
        if (!Number.isFinite(next)) {
          return;
        }
        setNumeric(next);
      }}
    />
  );

  if (compact) {
    return (
      <SettingRow label={label}>
        <div className="flex w-full items-center gap-1">
          {numberInput}
          {unitSelect}
        </div>
      </SettingRow>
    );
  }

  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="whitespace-nowrap text-[11px] text-navy/70">{label}</span>
        <select
          value={unit}
          className={`${inspectorField} w-[4.5rem]`}
          onChange={(event) => {
            const nextUnit = event.target.value;
            setEmptyUnit(nextUnit);
            if (!value) {
              return;
            }
            const nextRange = rangeFor(nextUnit);
            onChange({
              value: clampValue(value.value, nextRange.min, nextRange.max),
              unit: nextUnit,
            });
          }}
        >
          {units.map((item) => (
            <option key={item || "unitless"} value={item}>
              {unitLabel ? unitLabel(item) : item}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={step}
          value={value?.value ?? range.min}
          className="inspector-range"
          onChange={(event) => setNumeric(Number(event.target.value))}
        />
        <input
          type="number"
          min={range.min}
          max={range.max}
          step={step}
          value={value?.value ?? ""}
          className={inspectorNumber}
          onChange={(event) => {
            if (event.target.value === "") {
              onChange(null);
              return;
            }
            const next = Number(event.target.value);
            if (!Number.isFinite(next)) {
              return;
            }
            setNumeric(next);
          }}
        />
      </div>
    </div>
  );
}

function ClampedNumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const setNumeric = (raw: string) => {
    if (raw === "") {
      onChange(min);
      return;
    }
    const next = Number(raw);
    if (!Number.isFinite(next)) {
      return;
    }
    onChange(clampValue(next, min, max));
  };

  return (
    <div className="py-1.5">
      <span className="text-[11px] text-navy/70">{label}</span>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          className="inspector-range"
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          className={inspectorNumber}
          onChange={(event) => setNumeric(event.target.value)}
        />
      </div>
    </div>
  );
}

function AdvancedFields({
  appearance,
  onChange,
}: {
  appearance: WidgetAppearance;
  onChange: (patch: Partial<WidgetAppearance>) => void;
}) {
  const [openGroup, setOpenGroup] = useState("margin");
  const toggle = (id: string) => setOpenGroup((current) => (current === id ? "" : id));

  return (
    <>
      <InspectorGroup title="Margin" open={openGroup === "margin"} onToggle={() => toggle("margin")}>
        <SpacingField value={appearance.margin} onChange={(margin) => onChange({ margin })} />
      </InspectorGroup>
      <InspectorGroup title="Padding" open={openGroup === "padding"} onToggle={() => toggle("padding")}>
        <SpacingField value={appearance.padding} onChange={(padding) => onChange({ padding })} />
      </InspectorGroup>
    </>
  );
}

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  return (
    <SettingRow label={label}>
      <div className="flex w-full items-center gap-1">
        <input
          type="color"
          value={isHexColor(value) ? value : fallback}
          className="h-7 w-7 shrink-0 cursor-pointer rounded-[3px] border border-navy/20 bg-white p-0"
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          value={value}
          placeholder="Default"
          className={inspectorControl}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </SettingRow>
  );
}

function SpacingField({
  value,
  onChange,
}: {
  value: WidgetSpacing;
  onChange: (value: WidgetSpacing) => void;
}) {
  const edges: { key: keyof WidgetSpacing; mark: string }[] = [
    { key: "top", mark: "T" },
    { key: "right", mark: "R" },
    { key: "bottom", mark: "B" },
    { key: "left", mark: "L" },
  ];
  return (
    <div className="grid grid-cols-4 gap-1 py-1.5">
      {edges.map((edge) => (
        <label key={edge.key} className="block">
          <span className="mb-0.5 block text-center text-[10px] text-navy/45">{edge.mark}</span>
          <input
            type="number"
            min={0}
            max={200}
            value={value[edge.key]}
            className={`${inspectorControl} px-1 text-center`}
            onChange={(event) =>
              onChange({ ...value, [edge.key]: Math.max(0, Number(event.target.value) || 0) })
            }
          />
        </label>
      ))}
    </div>
  );
}

function SizeField({
  label,
  value,
  unit,
  allowAuto,
  onChange,
}: {
  label: string;
  value: number;
  unit: SizeUnit;
  allowAuto: boolean;
  onChange: (value: number, unit: SizeUnit) => void;
}) {
  const auto = allowAuto && value === 0;
  const max = unit === "%" ? 100 : 2000;
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] text-navy/70">{label}</span>
        <div className="flex overflow-hidden rounded-[3px] border border-navy/20">
          {SIZE_UNITS.map((item) => (
            <button
              key={item}
              type="button"
              className={`h-7 px-2 text-[10px] font-semibold ${
                unit === item && !auto ? "bg-navy/10 text-navy" : "bg-white text-navy/50"
              }`}
              onClick={() => onChange(auto ? (item === "%" ? 100 : 300) : Math.min(item === "%" ? 100 : 2000, value || 1), item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="range"
          min={allowAuto ? 0 : 1}
          max={max}
          disabled={auto}
          value={auto ? 0 : value}
          className="inspector-range"
          onChange={(event) => onChange(Number(event.target.value), unit)}
        />
        <input
          type="number"
          min={allowAuto ? 0 : 1}
          max={max}
          disabled={auto}
          value={auto ? "" : value}
          placeholder={auto ? "Auto" : undefined}
          className={inspectorNumber}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (allowAuto && event.target.value === "") {
              onChange(0, unit);
              return;
            }
            onChange(Math.min(max, Math.max(allowAuto ? 0 : 1, next || (allowAuto ? 0 : 1))), unit);
          }}
        />
      </div>
      {allowAuto ? (
        <label className="mt-1.5 flex items-center justify-end gap-2 text-[11px] text-navy/70">
          <input
            type="checkbox"
            className="h-4 w-4 accent-navy"
            checked={auto}
            onChange={(event) => onChange(event.target.checked ? 0 : unit === "%" ? 100 : 300, unit)}
          />
          Auto
        </label>
      ) : null}
    </div>
  );
}

function ImageFields({
  widget,
  appearance,
  mediaSlug,
  onChange,
  onAppearance,
}: {
  widget: Extract<TemplateWidget, { type: "image" }>;
  appearance: WidgetAppearance;
  mediaSlug: string;
  onChange: (widget: TemplateWidget) => void;
  onAppearance: (partial: Partial<WidgetAppearance>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setError("");
    setBusy(true);
    try {
      const data = new FormData();
      data.set("slug", mediaSlug);
      data.set("file", file);
      const response = await fetch("/admin/api/media", { method: "POST", body: data });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Upload failed.");
      }
      onChange({ ...widget, src: payload.url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            void upload(file);
          }
        }}
      />
      <button type="button" className={adminGhost} disabled={busy} onClick={() => fileRef.current?.click()}>
        {busy ? "Uploading…" : widget.src ? "Replace image" : "Upload image"}
      </button>
      {widget.src ? <img src={widget.src} alt="" className="mt-2 max-h-24 w-full object-contain" /> : null}
      <div className="divide-y divide-navy/10">
        <SettingRow label="Alt text">
          <input
            value={widget.alt}
            className={inspectorControl}
            onChange={(event) => onChange({ ...widget, alt: event.target.value })}
          />
        </SettingRow>
        <SettingRow label="Size">
          <select
            value={appearance.sizeMode}
            className={inspectorControl}
            onChange={(event) =>
              onAppearance({ sizeMode: event.target.value as (typeof IMAGE_SIZE_MODES)[number] })
            }
          >
            {IMAGE_SIZE_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode === "custom"
                  ? "Custom"
                  : mode === "fill-width"
                    ? "Wide as parent"
                    : mode === "fill-height"
                      ? "High as parent"
                      : "Fill parent"}
              </option>
            ))}
          </select>
        </SettingRow>
        {appearance.sizeMode === "custom" || appearance.sizeMode === "fill-height" ? (
          <SizeField
            label="Width"
            value={appearance.width}
            unit={appearance.widthUnit}
            allowAuto={false}
            onChange={(width, widthUnit) => onAppearance({ width, widthUnit })}
          />
        ) : null}
        {appearance.sizeMode === "custom" || appearance.sizeMode === "fill-width" ? (
          <SizeField
            label="Height"
            value={appearance.height}
            unit={appearance.heightUnit}
            allowAuto
            onChange={(height, heightUnit) => onAppearance({ height, heightUnit })}
          />
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </>
  );
}
