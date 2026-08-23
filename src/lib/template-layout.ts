import { fontFamilyCss } from "./google-fonts.ts";

export const WIDGET_TYPES = [
  "heading",
  "text",
  "image",
  "button",
  "icon",
  "spacer",
  "spec-list",
  "grid",
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number];

export const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
export type HeadingTag = (typeof HEADING_TAGS)[number];

export const BUTTON_STYLES = ["yellow", "navy", "outline"] as const;
export type ButtonStyle = (typeof BUTTON_STYLES)[number];

export const ICON_NAMES = [
  "box",
  "print",
  "truck",
  "check",
  "star",
  "leaf",
  "shield",
  "droplet",
  "layers",
  "scissors",
] as const;
export type TemplateIconName = (typeof ICON_NAMES)[number];

export type ColumnSpan = 3 | 4 | 6 | 8 | 12;

export type SpecRow = { label: string; value: string };

export const SIZE_UNITS = ["%", "px"] as const;
export type SizeUnit = (typeof SIZE_UNITS)[number];

export const IMAGE_SIZE_MODES = ["custom", "fill-width", "fill-height", "fill"] as const;
export type ImageSizeMode = (typeof IMAGE_SIZE_MODES)[number];

export const IMAGE_OBJECT_FITS = ["contain", "cover", "fill", "none", "scale-down"] as const;
export type ImageObjectFit = (typeof IMAGE_OBJECT_FITS)[number];

export const IMAGE_OBJECT_POSITIONS = ["center", "top", "bottom", "left", "right"] as const;
export type ImageObjectPosition = (typeof IMAGE_OBJECT_POSITIONS)[number];

export const WIDGET_ALIGNS = ["left", "center", "right"] as const;
export type WidgetAlign = (typeof WIDGET_ALIGNS)[number];

export type WidgetSpacing = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const FONT_SIZE_UNITS = ["px", "em", "rem", "vw"] as const;
export type FontSizeUnit = (typeof FONT_SIZE_UNITS)[number];

export const LINE_HEIGHT_UNITS = ["", "px", "em"] as const;
export type LineHeightUnit = (typeof LINE_HEIGHT_UNITS)[number];

export const SPACING_UNITS = ["px", "em"] as const;
export type SpacingUnit = (typeof SPACING_UNITS)[number];

export const FONT_WEIGHTS = ["", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;
export type FontWeight = (typeof FONT_WEIGHTS)[number];

export const TEXT_TRANSFORMS = ["none", "uppercase", "lowercase", "capitalize"] as const;
export type TextTransform = (typeof TEXT_TRANSFORMS)[number];

export const FONT_STYLES = ["normal", "italic"] as const;
export type FontStyle = (typeof FONT_STYLES)[number];

export const TEXT_DECORATIONS = ["none", "underline", "line-through"] as const;
export type TextDecoration = (typeof TEXT_DECORATIONS)[number];

export const BORDER_STYLES = ["none", "solid", "dashed", "dotted"] as const;
export type BorderStyle = (typeof BORDER_STYLES)[number];

export type LengthValue<Unit extends string> = { value: number; unit: Unit };

export type WidgetTypography = {
  fontFamily: string;
  fontSize: LengthValue<FontSizeUnit> | null;
  fontWeight: FontWeight;
  textTransform: TextTransform;
  fontStyle: FontStyle;
  textDecoration: TextDecoration;
  lineHeight: LengthValue<LineHeightUnit> | null;
  letterSpacing: LengthValue<SpacingUnit> | null;
  wordSpacing: LengthValue<SpacingUnit> | null;
};

export type WidgetBorder = {
  width: number;
  style: BorderStyle;
  color: string;
  radius: number;
};

export type WidgetShadow = {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
};

export type WidgetAppearance = {
  align: WidgetAlign;
  color: string;
  background: string;
  margin: WidgetSpacing;
  padding: WidgetSpacing;
  border: WidgetBorder;
  shadow: WidgetShadow;
  typography: WidgetTypography;
  sizeMode: ImageSizeMode;
  objectFit: ImageObjectFit;
  objectPosition: ImageObjectPosition;
  width: number;
  widthUnit: SizeUnit;
  height: number;
  heightUnit: SizeUnit;
  spacerHeight: number;
  divider: boolean;
  buttonStyle: ButtonStyle;
  iconSize: number;
};

export type WidgetAppearanceMap = Partial<Record<GridBreakpointId, WidgetAppearance>>;

export type WidgetFrame = {
  align: WidgetAlign;
  color: string;
  background: string;
  margin: WidgetSpacing;
  padding: WidgetSpacing;
};

type WidgetBase = {
  id: string;
  appearance: WidgetAppearanceMap;
};

export type TemplateWidget =
  | (WidgetBase & { type: "heading"; text: string; tag: HeadingTag })
  | (WidgetBase & { type: "text"; html: string })
  | (WidgetBase & { type: "image"; src: string; alt: string })
  | (WidgetBase & { type: "button"; label: string; href: string })
  | (WidgetBase & { type: "icon"; name: TemplateIconName; label: string })
  | (WidgetBase & { type: "spacer" })
  | (WidgetBase & { type: "spec-list"; rows: SpecRow[] })
  | (WidgetBase & {
      type: "grid";
      sizes: Partial<Record<GridBreakpointId, GridSize>>;
      cells: GridCell[];
    });

export const GRID_BREAKPOINTS = [
  { id: "base", label: "Mobile", short: "XS", minWidth: 0 },
  { id: "sm", label: "Small", short: "SM", minWidth: 640 },
  { id: "md", label: "Medium", short: "MD", minWidth: 768 },
  { id: "lg", label: "Large", short: "LG", minWidth: 1024 },
  { id: "xl", label: "Extra large", short: "XL", minWidth: 1280 },
  { id: "2xl", label: "2X large", short: "2XL", minWidth: 1536 },
] as const;

export type GridBreakpointId = (typeof GRID_BREAKPOINTS)[number]["id"];

export const SMALLER_THAN_LG = ["md", "sm", "base"] as const satisfies readonly GridBreakpointId[];
export const LARGER_THAN_LG = ["xl", "2xl"] as const satisfies readonly GridBreakpointId[];

export function resolvedBreakpointValue<T>(
  snapshots: Partial<Record<GridBreakpointId, T>>,
  breakpoint: GridBreakpointId,
  fallback: T,
): T {
  let current = snapshots.lg ?? fallback;
  if (breakpoint === "lg") {
    return current;
  }
  if ((SMALLER_THAN_LG as readonly string[]).includes(breakpoint)) {
    for (const id of SMALLER_THAN_LG) {
      const snapshot = snapshots[id];
      if (snapshot !== undefined) {
        current = snapshot;
      }
      if (id === breakpoint) {
        break;
      }
    }
    return current;
  }
  for (const id of LARGER_THAN_LG) {
    const snapshot = snapshots[id];
    if (snapshot !== undefined) {
      current = snapshot;
    }
    if (id === breakpoint) {
      break;
    }
  }
  return current;
}

export type GridSize = {
  columns: number;
  rows: number;
  gap: number;
};

export type GridCell = {
  id: string;
  widgets: TemplateWidget[];
};

export type TemplateColumn = {
  id: string;
  span: ColumnSpan;
  widgets: TemplateWidget[];
};

export type TemplateSection = {
  id: string;
  columns: TemplateColumn[];
};

export const SECTION_PRESETS: { id: string; label: string; spans: ColumnSpan[] }[] = [
  { id: "100", label: "100%", spans: [12] },
  { id: "50-50", label: "50 / 50", spans: [6, 6] },
  { id: "33", label: "33 / 33 / 33", spans: [4, 4, 4] },
  { id: "25", label: "25 × 4", spans: [3, 3, 3, 3] },
  { id: "33-66", label: "33 / 66", spans: [4, 8] },
  { id: "66-33", label: "66 / 33", spans: [8, 4] },
];

export const WIDGET_PALETTE_GROUPS: { id: string; title: string; items: { type: WidgetType; label: string }[] }[] = [
  {
    id: "layout",
    title: "Layout",
    items: [{ type: "grid", label: "Grid" }],
  },
  {
    id: "basic",
    title: "Basic",
    items: [
      { type: "heading", label: "Heading" },
      { type: "image", label: "Image" },
      { type: "text", label: "Text Editor" },
      { type: "button", label: "Button" },
      { type: "spacer", label: "Spacer" },
      { type: "icon", label: "Icon" },
      { type: "spec-list", label: "Spec list" },
    ],
  },
];

export const WIDGET_PALETTE = WIDGET_PALETTE_GROUPS.flatMap((group) => group.items);

export function newLayoutId() {
  return crypto.randomUUID();
}

export function isWidgetType(value: string): value is WidgetType {
  return (WIDGET_TYPES as readonly string[]).includes(value);
}

export function equalizeSpans(count: number): ColumnSpan[] {
  if (count <= 1) {
    return [12];
  }
  if (count === 2) {
    return [6, 6];
  }
  if (count === 3) {
    return [4, 4, 4];
  }
  return [3, 3, 3, 3];
}

export function emptySpacing(): WidgetSpacing {
  return { top: 0, right: 0, bottom: 0, left: 0 };
}

export function defaultFrame(): WidgetFrame {
  return {
    align: "left",
    color: "",
    background: "",
    margin: emptySpacing(),
    padding: emptySpacing(),
  };
}

export function defaultTypography(): WidgetTypography {
  return {
    fontFamily: "",
    fontSize: null,
    fontWeight: "",
    textTransform: "none",
    fontStyle: "normal",
    textDecoration: "none",
    lineHeight: null,
    letterSpacing: null,
    wordSpacing: null,
  };
}

export function defaultBorder(): WidgetBorder {
  return { width: 0, style: "none", color: "", radius: 0 };
}

export function defaultShadow(): WidgetShadow {
  return { enabled: false, x: 0, y: 0, blur: 8, spread: 0, color: "rgba(0,0,0,0.15)", inset: false };
}

export function defaultAppearance(): WidgetAppearance {
  return {
    align: "left",
    color: "",
    background: "",
    margin: emptySpacing(),
    padding: emptySpacing(),
    border: defaultBorder(),
    shadow: defaultShadow(),
    typography: defaultTypography(),
    sizeMode: "custom",
    objectFit: "contain",
    objectPosition: "center",
    width: 100,
    widthUnit: "%",
    height: 0,
    heightUnit: "px",
    spacerHeight: 24,
    divider: false,
    buttonStyle: "yellow",
    iconSize: 24,
  };
}

export function resolvedAppearance(
  appearance: WidgetAppearanceMap,
  breakpoint: GridBreakpointId,
): WidgetAppearance {
  return resolvedBreakpointValue(appearance, breakpoint, defaultAppearance());
}

export function mergeAppearance(base: WidgetAppearance, patch: Partial<WidgetAppearance>): WidgetAppearance {
  return {
    ...base,
    ...patch,
    typography: patch.typography ? { ...base.typography, ...patch.typography } : base.typography,
    border: patch.border ? { ...base.border, ...patch.border } : base.border,
    shadow: patch.shadow ? { ...base.shadow, ...patch.shadow } : base.shadow,
    margin: patch.margin ?? base.margin,
    padding: patch.padding ?? base.padding,
  };
}

export function setAppearance(
  appearance: WidgetAppearanceMap,
  breakpoint: GridBreakpointId,
  patch: Partial<WidgetAppearance>,
): WidgetAppearanceMap {
  const snapshot = mergeAppearance(resolvedAppearance(appearance, breakpoint), patch);
  return { ...appearance, [breakpoint]: snapshot };
}

export function resetAppearance(
  appearance: WidgetAppearanceMap,
  breakpoint: GridBreakpointId,
): WidgetAppearanceMap {
  if (breakpoint === "lg") {
    return { lg: defaultAppearance() };
  }
  const next = { ...appearance };
  delete next[breakpoint];
  return next;
}

export function imageFillsParentHeight(appearance: Pick<WidgetAppearance, "sizeMode">) {
  return appearance.sizeMode === "fill" || appearance.sizeMode === "fill-height";
}

export function imageSizeStyle(appearance: WidgetAppearance) {
  const customHeight = appearance.height > 0 ? `${appearance.height}${appearance.heightUnit}` : "auto";
  const customWidth = `${appearance.width}${appearance.widthUnit}`;
  const size =
    appearance.sizeMode === "fill"
      ? { width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%" }
      : appearance.sizeMode === "fill-width"
        ? { width: "100%", height: customHeight, maxWidth: "100%" }
        : appearance.sizeMode === "fill-height"
          ? { width: customWidth, height: "100%", maxWidth: "100%", maxHeight: "100%" }
          : { width: customWidth, height: customHeight, maxWidth: "100%" };
  return {
    display: "block" as const,
    ...size,
    objectFit: appearance.objectFit,
    objectPosition: appearance.objectPosition,
  };
}

function lengthCss(value: LengthValue<string> | null, unitless = false) {
  if (!value) {
    return undefined;
  }
  if (unitless && value.unit === "") {
    return String(value.value);
  }
  return `${value.value}${value.unit}`;
}

function shadowCss(shadow: WidgetShadow) {
  if (!shadow.enabled) {
    return undefined;
  }
  const inset = shadow.inset ? "inset " : "";
  return `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
}

export function widgetAppearanceStyle(appearance: WidgetAppearance) {
  const { typography } = appearance;
  return {
    textAlign: appearance.align,
    color: appearance.color || undefined,
    backgroundColor: appearance.background || undefined,
    margin: `${appearance.margin.top}px ${appearance.margin.right}px ${appearance.margin.bottom}px ${appearance.margin.left}px`,
    padding: `${appearance.padding.top}px ${appearance.padding.right}px ${appearance.padding.bottom}px ${appearance.padding.left}px`,
    borderWidth: `${appearance.border.width}px`,
    borderStyle: appearance.border.style,
    borderColor: appearance.border.color || undefined,
    borderRadius: `${appearance.border.radius}px`,
    boxShadow: shadowCss(appearance.shadow),
    fontFamily: fontFamilyCss(typography.fontFamily),
    fontSize: lengthCss(typography.fontSize),
    fontWeight: typography.fontWeight || undefined,
    textTransform: typography.textTransform || undefined,
    fontStyle: typography.fontStyle || undefined,
    textDecoration: typography.textDecoration || undefined,
    lineHeight: lengthCss(typography.lineHeight, true),
    letterSpacing: lengthCss(typography.letterSpacing),
    wordSpacing: lengthCss(typography.wordSpacing),
  };
}

const BUTTON_COLORS: Record<ButtonStyle, { background: string; foreground: string; border: string }> = {
  yellow: { background: "var(--scheme-button)", foreground: "var(--scheme-button-text)", border: "transparent" },
  navy: { background: "var(--scheme-primary)", foreground: "var(--scheme-on-primary)", border: "transparent" },
  outline: { background: "transparent", foreground: "var(--scheme-primary)", border: "var(--scheme-primary)" },
};

function spacingCss(spacing: WidgetSpacing) {
  return `${spacing.top}px ${spacing.right}px ${spacing.bottom}px ${spacing.left}px`;
}

function imageDimensionsCss(appearance: WidgetAppearance) {
  const customWidth = `${appearance.width}${appearance.widthUnit}`;
  const customHeight = appearance.height > 0 ? `${appearance.height}${appearance.heightUnit}` : "auto";
  if (appearance.sizeMode === "fill") {
    return { width: "100%", height: "100%" };
  }
  if (appearance.sizeMode === "fill-width") {
    return { width: "100%", height: customHeight };
  }
  if (appearance.sizeMode === "fill-height") {
    return { width: customWidth, height: "100%" };
  }
  return { width: customWidth, height: customHeight };
}

function appearanceCssVars(appearance: WidgetAppearance, suffix: string) {
  const { typography } = appearance;
  const imageDimensions = imageDimensionsCss(appearance);
  const buttonColors = BUTTON_COLORS[appearance.buttonStyle];
  return {
    [`--tw-align${suffix}`]: appearance.align,
    [`--tw-color${suffix}`]: appearance.color || "inherit",
    [`--tw-bg${suffix}`]: appearance.background || "transparent",
    [`--tw-m${suffix}`]: spacingCss(appearance.margin),
    [`--tw-p${suffix}`]: spacingCss(appearance.padding),
    [`--tw-bw${suffix}`]: `${appearance.border.width}px`,
    [`--tw-bs${suffix}`]: appearance.border.style,
    [`--tw-bc${suffix}`]: appearance.border.color || "currentColor",
    [`--tw-radius${suffix}`]: `${appearance.border.radius}px`,
    [`--tw-shadow${suffix}`]: shadowCss(appearance.shadow) || "none",
    [`--tw-ff${suffix}`]: fontFamilyCss(typography.fontFamily),
    [`--tw-fs${suffix}`]: lengthCss(typography.fontSize) || "inherit",
    [`--tw-fw${suffix}`]: typography.fontWeight || "inherit",
    [`--tw-tt${suffix}`]: typography.textTransform,
    [`--tw-fst${suffix}`]: typography.fontStyle,
    [`--tw-td${suffix}`]: typography.textDecoration,
    [`--tw-lh${suffix}`]: lengthCss(typography.lineHeight, true) || "inherit",
    [`--tw-ls${suffix}`]: lengthCss(typography.letterSpacing) || "inherit",
    [`--tw-ws${suffix}`]: lengthCss(typography.wordSpacing) || "inherit",
    [`--tw-img-w${suffix}`]: imageDimensions.width,
    [`--tw-img-h${suffix}`]: imageDimensions.height,
    [`--tw-img-fit${suffix}`]: appearance.objectFit,
    [`--tw-img-pos${suffix}`]: appearance.objectPosition,
    [`--tw-spacer-h${suffix}`]: `${appearance.spacerHeight}px`,
    [`--tw-divider${suffix}`]: appearance.divider ? "block" : "none",
    [`--tw-icon${suffix}`]: `${appearance.iconSize}px`,
    [`--tw-btn-bg${suffix}`]: buttonColors.background,
    [`--tw-btn-fg${suffix}`]: buttonColors.foreground,
    [`--tw-btn-bd${suffix}`]: buttonColors.border,
  };
}

export function widgetCssVars(appearance: WidgetAppearanceMap): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const breakpoint of GRID_BREAKPOINTS) {
    const suffix = breakpoint.id === "lg" ? "" : `-${breakpoint.id}`;
    Object.assign(variables, appearanceCssVars(resolvedAppearance(appearance, breakpoint.id), suffix));
  }
  return variables;
}

export function cloneWidget(widget: TemplateWidget): TemplateWidget {
  return assignNewWidgetIds(structuredClone(widget));
}

function assignNewWidgetIds(widget: TemplateWidget): TemplateWidget {
  const id = newLayoutId();
  if (widget.type === "grid") {
    return {
      ...widget,
      id,
      cells: widget.cells.map((cell) => ({
        id: newLayoutId(),
        widgets: cell.widgets.map(assignNewWidgetIds),
      })),
    };
  }
  return { ...widget, id };
}

export function createWidget(type: WidgetType): TemplateWidget {
  const id = newLayoutId();
  const appearance = { lg: defaultAppearance() };
  switch (type) {
    case "heading":
      return { id, appearance, type, text: "Heading", tag: "h3" };
    case "text":
      return { id, appearance, type, html: "<p>Add your text here.</p>" };
    case "image":
      return { id, appearance, type, src: "", alt: "" };
    case "button":
      return { id, appearance, type, label: "Get a quote", href: "/quote" };
    case "icon":
      return { id, appearance, type, name: "box", label: "" };
    case "spacer":
      return { id, appearance, type };
    case "spec-list":
      return { id, appearance, type, rows: [{ label: "Label", value: "Value" }] };
    case "grid": {
      const lg = defaultGridSize();
      return {
        id,
        appearance,
        type,
        sizes: { lg },
        cells: createGridCells(lg.columns * lg.rows),
      };
    }
  }
}

export function defaultGridSize(): GridSize {
  return { columns: 2, rows: 2, gap: 16 };
}

export function createGridCells(count: number): GridCell[] {
  return Array.from({ length: Math.max(1, count) }, () => ({ id: newLayoutId(), widgets: [] }));
}

export function gridCellCount(sizes: Partial<Record<GridBreakpointId, GridSize>>) {
  const counts = GRID_BREAKPOINTS.map((breakpoint) => {
    const size = sizes[breakpoint.id];
    return size ? size.columns * size.rows : 0;
  });
  return Math.max(1, ...counts);
}

export function ensureGridCells(cells: GridCell[], count: number) {
  const target = Math.max(1, count);
  if (cells.length === target) {
    return cells;
  }
  if (cells.length > target) {
    return cells.slice(0, target);
  }
  return [...cells, ...createGridCells(target - cells.length)];
}

export function visibleGridCells(cells: GridCell[], size: GridSize) {
  return cells.slice(0, Math.max(1, size.columns * size.rows));
}

const GRID_CELL_HIDE_CLASSES: Record<GridBreakpointId, string> = {
  base: "max-[639px]:hidden",
  sm: "min-[640px]:max-[767px]:hidden",
  md: "min-[768px]:max-[1023px]:hidden",
  lg: "min-[1024px]:max-[1279px]:hidden",
  xl: "min-[1280px]:max-[1535px]:hidden",
  "2xl": "min-[1536px]:hidden",
};

export function gridCellHiddenClass(
  index: number,
  sizes: Partial<Record<GridBreakpointId, GridSize>>,
) {
  return GRID_BREAKPOINTS.filter((breakpoint) => {
    const size = resolvedGridSize(sizes, breakpoint.id);
    return index >= size.columns * size.rows;
  })
    .map((breakpoint) => GRID_CELL_HIDE_CLASSES[breakpoint.id])
    .join(" ");
}

export function resolvedGridSize(
  sizes: Partial<Record<GridBreakpointId, GridSize>>,
  breakpoint: GridBreakpointId,
): GridSize {
  return resolvedBreakpointValue(sizes, breakpoint, defaultGridSize());
}

function gridSizeEqual(a: GridSize, b: GridSize) {
  return a.columns === b.columns && a.rows === b.rows && a.gap === b.gap;
}

function resolvedGridSizeMobileUp(
  sizes: Partial<Record<GridBreakpointId, GridSize>>,
  breakpoint: GridBreakpointId,
): GridSize {
  let current = sizes.base ?? defaultGridSize();
  for (const item of GRID_BREAKPOINTS) {
    const size = sizes[item.id];
    if (size) {
      current = size;
    }
    if (item.id === breakpoint) {
      break;
    }
  }
  return current;
}

function isDesktopDownGridSizes(sizes: Partial<Record<GridBreakpointId, GridSize>>) {
  return Boolean(sizes.lg && (sizes.md || sizes.sm || !sizes.base));
}

export function migrateGridSizes(
  sizes: Partial<Record<GridBreakpointId, GridSize>>,
): Partial<Record<GridBreakpointId, GridSize>> {
  if (isDesktopDownGridSizes(sizes)) {
    return { ...sizes };
  }
  const oldResolved = Object.fromEntries(
    GRID_BREAKPOINTS.map((item) => [item.id, resolvedGridSizeMobileUp(sizes, item.id)]),
  ) as Record<GridBreakpointId, GridSize>;
  const next: Partial<Record<GridBreakpointId, GridSize>> = { lg: oldResolved.lg };
  let downward = oldResolved.lg;
  for (const id of SMALLER_THAN_LG) {
    if (!gridSizeEqual(oldResolved[id], downward)) {
      next[id] = oldResolved[id];
      downward = oldResolved[id];
    }
  }
  let upward = oldResolved.lg;
  for (const id of LARGER_THAN_LG) {
    if (!gridSizeEqual(oldResolved[id], upward)) {
      next[id] = oldResolved[id];
      upward = oldResolved[id];
    }
  }
  return next;
}

export function gridCssVars(sizes: Partial<Record<GridBreakpointId, GridSize>>) {
  const vars: Record<string, string> = {};
  for (const breakpoint of GRID_BREAKPOINTS) {
    const size = resolvedGridSize(sizes, breakpoint.id);
    const suffix = breakpoint.id === "lg" ? "" : `-${breakpoint.id}`;
    vars[`--tg-cols${suffix}`] = String(size.columns);
    vars[`--tg-rows${suffix}`] = String(size.rows);
    vars[`--tg-gap${suffix}`] = `${size.gap}px`;
  }
  return vars;
}

export function createSection(spans: ColumnSpan[]): TemplateSection {
  return {
    id: newLayoutId(),
    columns: spans.map((span) => ({ id: newLayoutId(), span, widgets: [] })),
  };
}

export function htmlToLayout(html: string): TemplateSection[] {
  const trimmed = html.trim();
  if (!trimmed) {
    return [];
  }
  return [
    {
      id: newLayoutId(),
      columns: [
        {
          id: newLayoutId(),
          span: 12,
            widgets: [{ id: newLayoutId(), appearance: { lg: defaultAppearance() }, type: "text", html: trimmed }],
        },
      ],
    },
  ];
}

export function normalizeLayout(input: unknown): TemplateSection[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .map((section) => normalizeSection(section))
    .filter((section): section is TemplateSection => Boolean(section));
}

export function parseLayoutJson(raw: string): TemplateSection[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }
  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch {
    throw new Error("Invalid template layout.");
  }
  return normalizeLayout(data);
}

function normalizeSection(input: unknown): TemplateSection | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  const record = input as { id?: unknown; columns?: unknown };
  const columns = Array.isArray(record.columns)
    ? record.columns.map(normalizeColumn).filter((column): column is TemplateColumn => Boolean(column))
    : [];
  if (columns.length === 0) {
    return null;
  }
  return {
    id: asId(record.id),
    columns,
  };
}

function normalizeColumn(input: unknown): TemplateColumn | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  const record = input as { id?: unknown; span?: unknown; widgets?: unknown };
  const widgets = Array.isArray(record.widgets)
    ? record.widgets.map(normalizeWidget).filter((widget): widget is TemplateWidget => Boolean(widget))
    : [];
  return {
    id: asId(record.id),
    span: asSpan(record.span),
    widgets,
  };
}

function normalizeWidget(input: unknown): TemplateWidget | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  const record = input as Record<string, unknown>;
  const type = typeof record.type === "string" && isWidgetType(record.type) ? record.type : null;
  if (!type) {
    return null;
  }
  const id = asId(record.id);
  const appearance = normalizeWidgetAppearance(record, type);
  switch (type) {
    case "heading": {
      const tag = HEADING_TAGS.includes(record.tag as HeadingTag) ? (record.tag as HeadingTag) : "h3";
      return { id, appearance, type, tag, text: asString(record.text, "Heading") };
    }
    case "text":
      return { id, appearance, type, html: asString(record.html, "") };
    case "image":
      return { id, appearance, type, src: asString(record.src, ""), alt: asString(record.alt, "") };
    case "button":
      return { id, appearance, type, label: asString(record.label, "Button"), href: asString(record.href, "/quote") };
    case "icon": {
      const name = ICON_NAMES.includes(record.name as TemplateIconName)
        ? (record.name as TemplateIconName)
        : "box";
      return { id, appearance, type, name, label: asString(record.label, "") };
    }
    case "spacer":
      return { id, appearance, type };
    case "spec-list": {
      const rows = Array.isArray(record.rows)
        ? record.rows
            .map((row) => {
              if (!row || typeof row !== "object") {
                return null;
              }
              const item = row as { label?: unknown; value?: unknown };
              const label = asString(item.label, "");
              const value = asString(item.value, "");
              if (!label && !value) {
                return null;
              }
              return { label, value };
            })
            .filter((row): row is SpecRow => Boolean(row))
        : [];
      return { id, appearance, type, rows: rows.length > 0 ? rows : [{ label: "Label", value: "Value" }] };
    }
    case "grid": {
      const sizes = normalizeGridSizes(record.sizes);
      const cells = Array.isArray(record.cells)
        ? record.cells.map(normalizeGridCell).filter((cell): cell is GridCell => Boolean(cell))
        : [];
      return { id, appearance, type, sizes, cells: ensureGridCells(cells, gridCellCount(sizes)) };
    }
  }
}

function normalizeWidgetAppearance(record: Record<string, unknown>, type: WidgetType): WidgetAppearanceMap {
  const legacyFrame = normalizeFrame(record.frame);
  const seededLg = mergeAppearance(defaultAppearance(), {
    align: legacyFrame.align,
    color: legacyFrame.color,
    background: legacyFrame.background,
    margin: legacyFrame.margin,
    padding: legacyFrame.padding,
    ...legacyRootAppearance(record, type),
  });
  const appearance: WidgetAppearanceMap = {};
  const rawAppearance =
    record.appearance && typeof record.appearance === "object" ? (record.appearance as Record<string, unknown>) : {};
  for (const breakpoint of GRID_BREAKPOINTS) {
    const value = rawAppearance[breakpoint.id];
    if (value === undefined) {
      continue;
    }
    appearance[breakpoint.id] = normalizeAppearance(value, breakpoint.id === "lg" ? seededLg : defaultAppearance());
  }
  if (!appearance.lg) {
    appearance.lg = seededLg;
  }
  return appearance;
}

function legacyRootAppearance(record: Record<string, unknown>, type: WidgetType): Partial<WidgetAppearance> {
  const patch: Partial<WidgetAppearance> = {};
  if (record.sizeMode !== undefined) {
    patch.sizeMode = asEnum(record.sizeMode, IMAGE_SIZE_MODES, "custom");
  }
  if (record.objectFit !== undefined) {
    patch.objectFit = asEnum(record.objectFit, IMAGE_OBJECT_FITS, "contain");
  }
  if (record.objectPosition !== undefined) {
    patch.objectPosition = asEnum(record.objectPosition, IMAGE_OBJECT_POSITIONS, "center");
  }
  if (record.width !== undefined) {
    patch.width = clamp(asNumber(record.width, 100), 1, 2000);
  }
  if (record.widthUnit !== undefined) {
    patch.widthUnit = record.widthUnit === "px" ? "px" : "%";
  }
  if (record.heightUnit !== undefined) {
    patch.heightUnit = record.heightUnit === "%" ? "%" : "px";
  }
  if (record.style !== undefined) {
    patch.buttonStyle = asEnum(record.style, BUTTON_STYLES, "yellow");
  }
  if (record.buttonStyle !== undefined) {
    patch.buttonStyle = asEnum(record.buttonStyle, BUTTON_STYLES, "yellow");
  }
  if (record.divider !== undefined) {
    patch.divider = Boolean(record.divider);
  }
  if (record.spacerHeight !== undefined) {
    patch.spacerHeight = clamp(asNumber(record.spacerHeight, 24), 8, 160);
  }
  if (record.height !== undefined) {
    if (type === "spacer") {
      patch.spacerHeight = clamp(asNumber(record.height, 24), 8, 160);
    } else if (type === "image") {
      patch.height = clamp(asNumber(record.height, 0), 0, 2000);
    }
  }
  if (record.iconSize !== undefined) {
    patch.iconSize = clamp(asNumber(record.iconSize, 24), 8, 160);
  }
  return patch;
}

function normalizeAppearance(input: unknown, fallback = defaultAppearance()): WidgetAppearance {
  if (!input || typeof input !== "object") {
    return fallback;
  }
  const record = input as Record<string, unknown>;
  return {
    align: WIDGET_ALIGNS.includes(record.align as WidgetAlign) ? (record.align as WidgetAlign) : fallback.align,
    color: asString(record.color, fallback.color),
    background: asString(record.background, fallback.background),
    margin: record.margin !== undefined ? normalizeSpacing(record.margin) : fallback.margin,
    padding: record.padding !== undefined ? normalizeSpacing(record.padding) : fallback.padding,
    border: normalizeBorder(record.border, fallback.border),
    shadow: normalizeShadow(record.shadow, fallback.shadow),
    typography: normalizeTypography(record.typography, fallback.typography),
    sizeMode: record.sizeMode !== undefined ? asEnum(record.sizeMode, IMAGE_SIZE_MODES, fallback.sizeMode) : fallback.sizeMode,
    objectFit: record.objectFit !== undefined ? asEnum(record.objectFit, IMAGE_OBJECT_FITS, fallback.objectFit) : fallback.objectFit,
    objectPosition:
      record.objectPosition !== undefined
        ? asEnum(record.objectPosition, IMAGE_OBJECT_POSITIONS, fallback.objectPosition)
        : fallback.objectPosition,
    width: record.width !== undefined ? clamp(asNumber(record.width, fallback.width), 1, 2000) : fallback.width,
    widthUnit: record.widthUnit === "px" || record.widthUnit === "%" ? record.widthUnit : fallback.widthUnit,
    height: record.height !== undefined ? clamp(asNumber(record.height, fallback.height), 0, 2000) : fallback.height,
    heightUnit: record.heightUnit === "%" || record.heightUnit === "px" ? record.heightUnit : fallback.heightUnit,
    spacerHeight:
      record.spacerHeight !== undefined
        ? clamp(asNumber(record.spacerHeight, fallback.spacerHeight), 8, 160)
        : fallback.spacerHeight,
    divider: typeof record.divider === "boolean" ? record.divider : fallback.divider,
    buttonStyle:
      record.buttonStyle !== undefined ? asEnum(record.buttonStyle, BUTTON_STYLES, fallback.buttonStyle) : fallback.buttonStyle,
    iconSize: record.iconSize !== undefined ? clamp(asNumber(record.iconSize, fallback.iconSize), 8, 160) : fallback.iconSize,
  };
}

function normalizeTypography(input: unknown, fallback: WidgetTypography): WidgetTypography {
  if (!input || typeof input !== "object") {
    return fallback;
  }
  const record = input as Record<string, unknown>;
  return {
    fontFamily: asString(record.fontFamily, fallback.fontFamily),
    fontSize: record.fontSize !== undefined ? normalizeLength(record.fontSize, FONT_SIZE_UNITS, "px", 8, 200) : fallback.fontSize,
    fontWeight: asEnum(record.fontWeight, FONT_WEIGHTS, fallback.fontWeight),
    textTransform: asEnum(record.textTransform, TEXT_TRANSFORMS, fallback.textTransform),
    fontStyle: asEnum(record.fontStyle, FONT_STYLES, fallback.fontStyle),
    textDecoration: asEnum(record.textDecoration, TEXT_DECORATIONS, fallback.textDecoration),
    lineHeight: record.lineHeight !== undefined ? normalizeLineHeight(record.lineHeight) : fallback.lineHeight,
    letterSpacing:
      record.letterSpacing !== undefined
        ? normalizeLength(record.letterSpacing, SPACING_UNITS, "px", -20, 40)
        : fallback.letterSpacing,
    wordSpacing:
      record.wordSpacing !== undefined
        ? normalizeLength(record.wordSpacing, SPACING_UNITS, "px", -20, 40)
        : fallback.wordSpacing,
  };
}

function normalizeBorder(input: unknown, fallback: WidgetBorder): WidgetBorder {
  if (!input || typeof input !== "object") {
    return fallback;
  }
  const record = input as Record<string, unknown>;
  return {
    width: record.width !== undefined ? clamp(asNumber(record.width, fallback.width), 0, 80) : fallback.width,
    style: record.style !== undefined ? asEnum(record.style, BORDER_STYLES, fallback.style) : fallback.style,
    color: asString(record.color, fallback.color),
    radius: record.radius !== undefined ? clamp(asNumber(record.radius, fallback.radius), 0, 80) : fallback.radius,
  };
}

function normalizeShadow(input: unknown, fallback: WidgetShadow): WidgetShadow {
  if (!input || typeof input !== "object") {
    return fallback;
  }
  const record = input as Record<string, unknown>;
  return {
    enabled: typeof record.enabled === "boolean" ? record.enabled : fallback.enabled,
    x: record.x !== undefined ? clamp(asNumber(record.x, fallback.x), 0, 80) : fallback.x,
    y: record.y !== undefined ? clamp(asNumber(record.y, fallback.y), 0, 80) : fallback.y,
    blur: record.blur !== undefined ? clamp(asNumber(record.blur, fallback.blur), 0, 80) : fallback.blur,
    spread: record.spread !== undefined ? clamp(asNumber(record.spread, fallback.spread), 0, 80) : fallback.spread,
    color: asString(record.color, fallback.color),
    inset: typeof record.inset === "boolean" ? record.inset : fallback.inset,
  };
}

function normalizeLength<Unit extends string>(
  input: unknown,
  units: readonly Unit[],
  fallbackUnit: Unit,
  min: number,
  max: number,
): LengthValue<Unit> | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  const record = input as { value?: unknown; unit?: unknown };
  if (typeof record.value !== "number" || !Number.isFinite(record.value)) {
    return null;
  }
  const unit =
    typeof record.unit === "string" && units.includes(record.unit as Unit) ? (record.unit as Unit) : fallbackUnit;
  return { value: clamp(record.value, min, max), unit };
}

function normalizeLineHeight(input: unknown): LengthValue<LineHeightUnit> | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  const record = input as { value?: unknown; unit?: unknown };
  if (typeof record.value !== "number" || !Number.isFinite(record.value)) {
    return null;
  }
  const unit = asEnum(record.unit, LINE_HEIGHT_UNITS, "");
  const range = unit === "" ? { min: 0.8, max: 3 } : { min: 8, max: 200 };
  return { value: clamp(record.value, range.min, range.max), unit };
}

function normalizeGridSizes(input: unknown): Partial<Record<GridBreakpointId, GridSize>> {
  const record = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const raw: Partial<Record<GridBreakpointId, GridSize>> = {};
  for (const breakpoint of GRID_BREAKPOINTS) {
    const size = normalizeGridSize(record[breakpoint.id]);
    if (size) {
      raw[breakpoint.id] = size;
    }
  }
  if (!raw.lg && !raw.base) {
    return { lg: defaultGridSize() };
  }
  if (isDesktopDownGridSizes(raw)) {
    return raw;
  }
  return migrateGridSizes(raw);
}

function normalizeGridSize(input: unknown): GridSize | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  const record = input as Record<string, unknown>;
  return {
    columns: clamp(asNumber(record.columns, 2), 1, 12),
    rows: clamp(asNumber(record.rows, 2), 1, 12),
    gap: clamp(asNumber(record.gap, 16), 0, 80),
  };
}

function normalizeGridCell(input: unknown): GridCell | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  const record = input as { id?: unknown; widgets?: unknown };
  const widgets = Array.isArray(record.widgets)
    ? record.widgets
        .map(normalizeWidget)
        .filter((widget): widget is TemplateWidget => widget !== null && widget.type !== "grid")
    : [];
  return { id: asId(record.id), widgets };
}

function normalizeFrame(input: unknown): WidgetFrame {
  const fallback = defaultFrame();
  if (!input || typeof input !== "object") {
    return fallback;
  }
  const record = input as Record<string, unknown>;
  const align = WIDGET_ALIGNS.includes(record.align as WidgetAlign) ? (record.align as WidgetAlign) : "left";
  return {
    align,
    color: asString(record.color, ""),
    background: asString(record.background, ""),
    margin: normalizeSpacing(record.margin),
    padding: normalizeSpacing(record.padding),
  };
}

function normalizeSpacing(input: unknown): WidgetSpacing {
  if (!input || typeof input !== "object") {
    return emptySpacing();
  }
  const record = input as Record<string, unknown>;
  return {
    top: clamp(asNumber(record.top, 0), 0, 200),
    right: clamp(asNumber(record.right, 0), 0, 200),
    left: clamp(asNumber(record.left, 0), 0, 200),
    bottom: clamp(asNumber(record.bottom, 0), 0, 200),
  };
}

export function plainTextFromLayout(layout: TemplateSection[]) {
  return layout
    .flatMap((section) => section.columns.flatMap((column) => column.widgets))
    .map(widgetPlainText)
    .filter(Boolean)
    .join(" ");
}

export function layoutToHtml(layout: TemplateSection[]) {
  return layout
    .flatMap((section) => section.columns.flatMap((column) => column.widgets))
    .map(widgetToHtml)
    .filter(Boolean)
    .join("");
}

function widgetPlainText(widget: TemplateWidget): string {
  switch (widget.type) {
    case "heading":
      return widget.text;
    case "text":
      return widget.html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    case "image":
      return widget.alt;
    case "button":
      return widget.label;
    case "icon":
      return widget.label;
    case "spacer":
      return "";
    case "spec-list":
      return widget.rows.map((row) => `${row.label} ${row.value}`).join(" ");
    case "grid":
      return widget.cells.flatMap((cell) => cell.widgets).map(widgetPlainText).filter(Boolean).join(" ");
  }
}

function widgetToHtml(widget: TemplateWidget): string {
  switch (widget.type) {
    case "heading":
      return `<${widget.tag} class="whitespace-pre-wrap">${escapeHtml(widget.text)}</${widget.tag}>`;
    case "text":
      return widget.html;
    case "image":
      return widget.src
        ? `<p><img src="${escapeHtml(widget.src)}" alt="${escapeHtml(widget.alt)}" style="${imageStyleAttr(resolvedAppearance(widget.appearance, "lg"))}" /></p>`
        : "";
    case "button":
      return `<p><a href="${escapeHtml(widget.href)}">${escapeHtml(widget.label)}</a></p>`;
    case "icon":
      return widget.label ? `<p>${escapeHtml(widget.label)}</p>` : "";
    case "spacer":
      return resolvedAppearance(widget.appearance, "lg").divider ? "<hr />" : "";
    case "spec-list": {
      const rows = widget.rows
        .map((row) => `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`)
        .join("");
      return `<table><tbody>${rows}</tbody></table>`;
    }
    case "grid":
      return widget.cells.flatMap((cell) => cell.widgets).map(widgetToHtml).filter(Boolean).join("");
  }
}

function asId(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : newLayoutId();
}

function imageStyleAttr(appearance: WidgetAppearance) {
  const style = imageSizeStyle(appearance);
  return [
    `display:${style.display}`,
    `width:${style.width}`,
    `height:${style.height}`,
    style.maxWidth ? `max-width:${style.maxWidth}` : "",
    style.maxHeight ? `max-height:${style.maxHeight}` : "",
    `object-fit:${style.objectFit}`,
    `object-position:${style.objectPosition}`,
  ]
    .filter(Boolean)
    .join(";");
}

function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asSpan(value: unknown): ColumnSpan {
  return value === 3 || value === 4 || value === 6 || value === 8 || value === 12 ? value : 12;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
