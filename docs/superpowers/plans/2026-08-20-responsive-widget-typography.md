# Responsive Widget Typography and Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Elementor-like typography, border, radius, and box shadow to template widgets, and make all appearance settings (including grid, image size, spacer, and button look) follow the six screen sizes with a desktop-down cascade.

**Architecture:** LG is the required default snapshot. Optional snapshots at MD/SM/XS apply downward; XL/2XL apply upward. Admin canvas uses the resolver as inline styles for the selected preview breakpoint. The public page emits resolved CSS variables per breakpoint and maps them with max-width (below LG) and min-width (above LG). Google Fonts are collected from the layout and loaded with one stylesheet.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind v4, `node --experimental-strip-types --test` for unit tests. No new npm dependencies.

## Global Constraints

- Content (heading text, TinyMCE HTML, image `src`/`alt`, button label/href, icon name/label, spec-list rows, grid cells) is not per breakpoint.
- Breakpoint IDs stay `base` | `sm` | `md` | `lg` | `xl` | `2xl`. Do not rename `base`. LG is the cascade default, not `base`.
- Font family: inherit, site sans/serif/mono, plus a curated Google Fonts list (no API key).
- This pass: typography + border + radius + box shadow + make existing appearance controls responsive. No hover, filters, blend, motion, or per-breakpoint content.
- Empty color / family / size means inherit (theme default), not a forced black or zero.
- Heading `tag` stays content. Visual size comes from typography; remove Tailwind `text-3xl` etc. on the public heading.
- Do not rewrite catalog JSON except when the user saves a template. Migrate on read in `normalizeWidget` / `normalizeGridSizes`.
- Tests: `node --experimental-strip-types --test src/lib/template-layout.test.ts src/lib/google-fonts.test.ts`
- `tsconfig.json` already excludes `**/*.test.ts`. Test files import with a `.ts` suffix for Node.
- Do not create git commits unless the user explicitly asks. Skip every Commit step.
- Comments in English. Imports at top of file. Only implement what this plan specifies.

## File map

| File | Responsibility |
| --- | --- |
| `src/lib/template-layout.ts` | Types, cascade, defaults, normalize/migrate, CSS vars, canvas style helpers |
| `src/lib/google-fonts.ts` | Curated families, URL builder, collect from layout |
| `src/lib/template-layout.test.ts` | Cascade, grid migrate, cells |
| `src/lib/google-fonts.test.ts` | Font URL + collection |
| `src/app/globals.css` | Desktop-down media queries for `.template-grid` and `.template-widget` |
| `src/components/admin/WidgetInspector.tsx` | Breakpoint bar, typography, border, shadow, appearance patches |
| `src/components/admin/TemplateLayoutBuilder.tsx` | Canvas uses resolved appearance at preview breakpoint; load Google Fonts |
| `src/components/TemplateLayoutView.tsx` | CSS vars, font link, no heading size classes |
| `src/lib/catalog.ts` | Default templates use `appearance` instead of `frame` |

---

### Task 1: Desktop-down cascade helper

**Files:**
- Modify: `src/lib/template-layout.ts`
- Test: `src/lib/template-layout.test.ts`

**Interfaces:**
- Consumes: existing `GRID_BREAKPOINTS`, `GridBreakpointId`
- Produces:
  - `export const SMALLER_THAN_LG: readonly GridBreakpointId[]` = `["md", "sm", "base"]`
  - `export const LARGER_THAN_LG: readonly GridBreakpointId[]` = `["xl", "2xl"]`
  - `export function resolvedBreakpointValue<T>(snapshots: Partial<Record<GridBreakpointId, T>>, breakpoint: GridBreakpointId, fallback: T): T`

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/template-layout.test.ts` (keep the existing cell tests). Import `resolvedBreakpointValue`.

```ts
test("LG-only snapshot applies at every breakpoint", () => {
  const snapshots = { lg: 24 };
  for (const id of ["base", "sm", "md", "lg", "xl", "2xl"] as const) {
    assert.equal(resolvedBreakpointValue(snapshots, id, 0), 24);
  }
});

test("SM override applies to SM and XS only", () => {
  const snapshots = { lg: 24, sm: 16 };
  assert.equal(resolvedBreakpointValue(snapshots, "lg", 0), 24);
  assert.equal(resolvedBreakpointValue(snapshots, "md", 0), 24);
  assert.equal(resolvedBreakpointValue(snapshots, "sm", 0), 16);
  assert.equal(resolvedBreakpointValue(snapshots, "base", 0), 16);
  assert.equal(resolvedBreakpointValue(snapshots, "xl", 0), 24);
});

test("XL override applies to XL and 2XL only", () => {
  const snapshots = { lg: 24, xl: 20 };
  assert.equal(resolvedBreakpointValue(snapshots, "lg", 0), 24);
  assert.equal(resolvedBreakpointValue(snapshots, "xl", 0), 20);
  assert.equal(resolvedBreakpointValue(snapshots, "2xl", 0), 20);
  assert.equal(resolvedBreakpointValue(snapshots, "md", 0), 24);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `export PATH="/Users/zakir/.local/node/bin:$PATH" && node --experimental-strip-types --test src/lib/template-layout.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` or `resolvedBreakpointValue is not a function`.

- [ ] **Step 3: Implement the helper**

In `src/lib/template-layout.ts`, immediately after `GRID_BREAKPOINTS` / `GridBreakpointId`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `export PATH="/Users/zakir/.local/node/bin:$PATH" && node --experimental-strip-types --test src/lib/template-layout.test.ts`

Expected: all tests PASS, including the three new ones and the existing cell tests.

- [ ] **Step 5: Commit**

Skip unless the user asked to commit.

---

### Task 2: Grid sizes use desktop-down cascade and migrate old mobile-up data

**Files:**
- Modify: `src/lib/template-layout.ts` (`resolvedGridSize`, `gridCssVars`, `normalizeGridSizes`, `createWidget` grid case)
- Modify: `src/app/globals.css` (`.template-grid` media queries)
- Test: `src/lib/template-layout.test.ts`

**Interfaces:**
- Consumes: `resolvedBreakpointValue`, `defaultGridSize`, `normalizeGridSize`
- Produces:
  - `resolvedGridSize(sizes, breakpoint)` now desktop-down (LG default)
  - `migrateGridSizes(input)` used by normalize: preserves old mobile-up pixels
  - `gridCssVars`: unsuffixed vars are LG; `--tg-*-md|sm|base` for max-width; `--tg-*-xl|2xl` for min-width
  - New grids: `sizes: { lg: defaultGridSize() }` not `{ base: ... }`

- [ ] **Step 1: Write the failing tests**

```ts
test("resolvedGridSize uses LG as default for every screen", () => {
  const sizes = { lg: { columns: 4, rows: 4, gap: 16 } };
  assert.deepEqual(resolvedGridSize(sizes, "base").columns, 4);
  assert.deepEqual(resolvedGridSize(sizes, "xl").columns, 4);
});

test("migrateGridSizes keeps base 2x2 below LG and lg 4x4 at LG and up", () => {
  const migrated = migrateGridSizes({
    base: { columns: 2, rows: 2, gap: 16 },
    lg: { columns: 4, rows: 4, gap: 16 },
  });
  assert.equal(resolvedGridSize(migrated, "base").columns, 2);
  assert.equal(resolvedGridSize(migrated, "md").columns, 2);
  assert.equal(resolvedGridSize(migrated, "lg").columns, 4);
  assert.equal(resolvedGridSize(migrated, "2xl").columns, 4);
});
```

Keep a **private** copy of the old walker only inside `migrateGridSizes` so the test of `resolvedGridSize` is the new behavior.

- [ ] **Step 2: Run tests to verify they fail**

Run: `export PATH="/Users/zakir/.local/node/bin:$PATH" && node --experimental-strip-types --test src/lib/template-layout.test.ts`

Expected: FAIL (`resolvedGridSize` still starts at `base`; `migrateGridSizes` missing).

- [ ] **Step 3: Replace `resolvedGridSize` and add migration**

Replace `resolvedGridSize` with:

```ts
export function resolvedGridSize(
  sizes: Partial<Record<GridBreakpointId, GridSize>>,
  breakpoint: GridBreakpointId,
): GridSize {
  return resolvedBreakpointValue(sizes, breakpoint, defaultGridSize());
}
```

Add `gridSizeEqual` and `migrateGridSizes`:

```ts
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

export function migrateGridSizes(
  sizes: Partial<Record<GridBreakpointId, GridSize>>,
): Partial<Record<GridBreakpointId, GridSize>> {
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
```

Change `normalizeGridSizes` to:

```ts
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
  return migrateGridSizes(raw);
}
```

In `createWidget` for `"grid"`: `sizes: { lg: defaultGridSize() }` and cells from `lg.columns * lg.rows`.

Change `gridCssVars` so unsuffixed keys are LG:

```ts
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
```

Replace the `.template-grid` media-query block in `src/app/globals.css` with:

```css
.template-grid {
  display: grid;
  grid-template-columns: repeat(var(--tg-cols), minmax(0, 1fr));
  grid-template-rows: repeat(var(--tg-rows), minmax(0, 1fr));
  gap: var(--tg-gap);
}

@media (max-width: 1023px) {
  .template-grid {
    grid-template-columns: repeat(var(--tg-cols-md), minmax(0, 1fr));
    grid-template-rows: repeat(var(--tg-rows-md), minmax(0, 1fr));
    gap: var(--tg-gap-md);
  }
}

@media (max-width: 767px) {
  .template-grid {
    grid-template-columns: repeat(var(--tg-cols-sm), minmax(0, 1fr));
    grid-template-rows: repeat(var(--tg-rows-sm), minmax(0, 1fr));
    gap: var(--tg-gap-sm);
  }
}

@media (max-width: 639px) {
  .template-grid {
    grid-template-columns: repeat(var(--tg-cols-base), minmax(0, 1fr));
    grid-template-rows: repeat(var(--tg-rows-base), minmax(0, 1fr));
    gap: var(--tg-gap-base);
  }
}

@media (min-width: 1280px) {
  .template-grid {
    grid-template-columns: repeat(var(--tg-cols-xl), minmax(0, 1fr));
    grid-template-rows: repeat(var(--tg-rows-xl), minmax(0, 1fr));
    gap: var(--tg-gap-xl);
  }
}

@media (min-width: 1536px) {
  .template-grid {
    grid-template-columns: repeat(var(--tg-cols-2xl), minmax(0, 1fr));
    grid-template-rows: repeat(var(--tg-rows-2xl), minmax(0, 1fr));
    gap: var(--tg-gap-2xl);
  }
}
```

Remove the old `min-width: 640px/768px/1024px` `.template-grid` rules so they cannot fight the new cascade.

- [ ] **Step 4: Run tests**

Run: `export PATH="/Users/zakir/.local/node/bin:$PATH" && node --experimental-strip-types --test src/lib/template-layout.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Skip unless the user asked to commit.

---

### Task 3: Widget appearance types, defaults, normalize, createWidget

**Files:**
- Modify: `src/lib/template-layout.ts`
- Modify: `src/lib/catalog.ts` (replace `frame: defaultFrame()` with `appearance: { lg: defaultAppearance() }`)
- Modify call sites that read `widget.frame` / image size / button `style` / spacer `height` so TypeScript passes (minimal: resolve `appearance.lg` or `resolvedAppearance(widget.appearance, "lg")`). Full inspector UX is Task 6–7.
- Test: `src/lib/template-layout.test.ts`

**Interfaces:**
- Consumes: `resolvedBreakpointValue`, `emptySpacing`, `WIDGET_ALIGNS`
- Produces the types and functions below. `WidgetFrame` and `defaultFrame()` may remain as a chrome helper used only while migrating, but runtime widgets use `appearance`, not `frame`.

Add these types (after `WidgetSpacing`):

```ts
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
```

Change `WidgetBase` to `{ id: string; appearance: WidgetAppearanceMap }`.

Simplify widget variants: image is `{ src, alt }` only; button is `{ label, href }` only; spacer has no height/divider on the root; icon stays `{ name, label }`.

```ts
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
```

`imageSizeStyle` / `imageFillsParentHeight` take `WidgetAppearance` (or a subset). Callers pass `resolvedAppearance(...)`.

Replace `widgetFrameStyle(frame)` with `widgetAppearanceStyle(appearance: WidgetAppearance)` returning React CSS properties for canvas:

- textAlign, color, backgroundColor, margin, padding
- borderWidth/Style/Color, borderRadius
- boxShadow if `shadow.enabled`
- fontFamily, fontSize, fontWeight, textTransform, fontStyle, textDecoration, lineHeight, letterSpacing, wordSpacing when those fields are non-empty/non-null

Length CSS: `fontSize: value ? `${value.value}${value.unit}` : undefined`. Unitless line-height: `String(value.value)` when `unit === ""`.

`normalizeWidget`:

1. Build `legacyFrame = normalizeFrame(record.frame)`.
2. Read optional `record.appearance` object; for each breakpoint, `normalizeAppearance(value)`.
3. Seed `lg` from `defaultAppearance()` + chrome from `legacyFrame` + image/button/spacer root fields if present (`sizeMode`, `width`, `style` as `buttonStyle`, `height` as `spacerHeight` or image height depending on type).
4. If `record.appearance.lg` exists, it wins over the seed (merge).
5. Result `appearance` always has `lg`.

Clamp: font size 8–200; unitless line-height 0.8–3; px/em line-height 8–200; letter/word −20–40; radius 0–80; shadow lengths 0–80; spacer 8–160; spacing 0–200.

`createWidget`: `appearance: { lg: defaultAppearance() }` and no `frame`.

`catalog.ts`: `appearance: { lg: defaultAppearance() }` instead of `frame: defaultFrame()`.

- [ ] **Step 1: Write failing tests**

```ts
test("normalizeWidget copies legacy frame into appearance.lg", () => {
  const widget = normalizeLayout([
    {
      id: "s",
      columns: [
        {
          id: "c",
          span: 12,
          widgets: [
            {
              id: "h",
              type: "heading",
              tag: "h2",
              text: "Hi",
              frame: { align: "center", color: "#111111", background: "", margin: emptySpacing(), padding: emptySpacing() },
            },
          ],
        },
      ],
    },
  ])[0].columns[0].widgets[0];
  assert.equal(widget.appearance.lg?.align, "center");
  assert.equal(widget.appearance.lg?.color, "#111111");
  assert.equal(resolvedAppearance(widget.appearance, "base").align, "center");
});
```

`normalizeLayout` is already exported. If the test cannot import a heading-only layout that way, export `normalizeWidget` for tests **or** round-trip via `normalizeLayout`. Prefer using `normalizeLayout`.

- [ ] **Step 2: Run tests — expect FAIL** (no `appearance` on widgets)

- [ ] **Step 3: Implement types, helpers, normalize, createWidget, and fix TypeScript call sites** so `npx tsc --noEmit` passes. Inspector and views may still only use LG / `previewBreakpoint` resolver; do not build the typography UI yet.

For inspector temporarily:

```ts
const current = resolvedAppearance(widget.appearance, previewBreakpoint);
const patch = (partial: Partial<WidgetAppearance>) =>
  onChange({ ...widget, appearance: setAppearance(widget.appearance, previewBreakpoint, partial) });
```

Wire existing alignment/color/background/margin/padding to `current` + `patch`. Image size, spacer, button style read/write the same `current` extras.

- [ ] **Step 4: Run** `node --experimental-strip-types --test src/lib/template-layout.test.ts` and `npx tsc --noEmit`

Expected: PASS / no errors.

- [ ] **Step 5: Commit** — skip unless asked.

---

### Task 4: Public CSS variables for widget appearance

**Files:**
- Modify: `src/lib/template-layout.ts` (add `widgetCssVars`)
- Modify: `src/app/globals.css`
- Modify: `src/components/TemplateLayoutView.tsx`

**Interfaces:**
- Consumes: `resolvedAppearance`, `GRID_BREAKPOINTS`
- Produces: `export function widgetCssVars(appearance: WidgetAppearanceMap): Record<string, string>`

Variable names (unsuffixed = LG; suffix `-${id}` otherwise):

`--tw-align`, `--tw-color`, `--tw-bg`, `--tw-m`, `--tw-p`, `--tw-bw`, `--tw-bs`, `--tw-bc`, `--tw-radius`, `--tw-shadow`, `--tw-ff`, `--tw-fs`, `--tw-fw`, `--tw-tt`, `--tw-fst`, `--tw-td`, `--tw-lh`, `--tw-ls`, `--tw-ws`, `--tw-img-w`, `--tw-img-h`, `--tw-img-fit`, `--tw-img-pos`, `--tw-spacer-h`, `--tw-icon`, `--tw-btn-bg`, `--tw-btn-fg`, `--tw-btn-bd`

Button colors from `buttonStyle`:

- yellow: bg `#f5c518`, fg `#12315a`, bd transparent
- navy: bg `#12315a`, fg `#ffffff`, bd transparent
- outline: bg transparent, fg `#12315a`, bd `#12315a`

Empty color → `inherit`. Empty font family → `inherit`. Null font size → `inherit`.

- [ ] **Step 1: Write a test** that `widgetCssVars({ lg: defaultAppearance() })["--tw-align"] === "left"` and `widgetCssVars({ lg: { ...defaultAppearance(), typography: { ...defaultTypography(), fontSize: { value: 20, unit: "px" } } }, sm: { ... } })["--tw-fs-sm"]` is the SM resolved size.

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement `widgetCssVars` and CSS**

Add `.template-widget` in `globals.css` (same media-query breakpoints as Task 2 grid). Apply the variables to the wrapper. Children inherit typography:

```css
.template-widget {
  text-align: var(--tw-align);
  color: var(--tw-color);
  background-color: var(--tw-bg);
  margin: var(--tw-m);
  padding: var(--tw-p);
  border-width: var(--tw-bw);
  border-style: var(--tw-bs);
  border-color: var(--tw-bc);
  border-radius: var(--tw-radius);
  box-shadow: var(--tw-shadow);
  font-family: var(--tw-ff);
  font-size: var(--tw-fs);
  font-weight: var(--tw-fw);
  text-transform: var(--tw-tt);
  font-style: var(--tw-fst);
  text-decoration: var(--tw-td);
  line-height: var(--tw-lh);
  letter-spacing: var(--tw-ls);
  word-spacing: var(--tw-ws);
}

.template-widget .template-image {
  width: var(--tw-img-w);
  height: var(--tw-img-h);
  object-fit: var(--tw-img-fit);
  object-position: var(--tw-img-pos);
}

.template-spacer {
  height: var(--tw-spacer-h);
}

.template-icon-glyph {
  width: var(--tw-icon);
  height: var(--tw-icon);
}

.template-widget-button {
  background: var(--tw-btn-bg);
  color: var(--tw-btn-fg);
  border: 1px solid var(--tw-btn-bd);
}
```

Duplicate the max-width / min-width blocks like `.template-grid`, swapping in the `-md`, `-sm`, `-base`, `-xl`, `-2xl` suffixes for every `--tw-*` property used above.

In `TemplateLayoutView`, wrap each widget (section widgets and grid children) with `className="template-widget"` and `style={widgetCssVars(widget.appearance)}`. Remove heading Tailwind size/weight classes (`font-semibold text-3xl` etc.). Button uses `className="template-widget-button inline-flex rounded px-4 py-2 text-sm font-semibold"`. Spacer uses `className="template-spacer"`. Icon box uses `className="template-icon-glyph"`. Stop passing `imageSizeStyle` inline on the public image (CSS vars handle it). Keep `imageFillsParentHeight(resolvedAppearance(...))` for fill class.

- [ ] **Step 4: Tests + `npx tsc --noEmit`**

- [ ] **Step 5: Commit** — skip unless asked.

---

### Task 5: Google Fonts module

**Files:**
- Create: `src/lib/google-fonts.ts`
- Create: `src/lib/google-fonts.test.ts`

**Interfaces:**
- Consumes: `TemplateSection[]`, `WidgetAppearanceMap` (walk widgets + grid cells)
- Produces:
  - `export const SITE_FONT_OPTIONS: { id: string; label: string; css: string }[]`
  - `export const GOOGLE_FONT_NAMES: string[]` (curated, ≥20 families)
  - `export function isGoogleFont(family: string): boolean`
  - `export function fontFamilyCss(family: string): string` — `inherit` / site stacks / `"Roboto", sans-serif`
  - `export function collectGoogleFonts(layout: TemplateSection[]): { family: string; weights: string[] }[]`
  - `export function googleFontsStylesheetUrl(fonts: { family: string; weights: string[] }[]): string | null`

Site options:

```ts
export const SITE_FONT_OPTIONS = [
  { id: "", label: "Default", css: "inherit" },
  { id: "sans", label: "Site sans", css: "var(--font-sans), Helvetica, Arial, sans-serif" },
  { id: "serif", label: "Serif", css: "Georgia, 'Times New Roman', serif" },
  { id: "mono", label: "Mono", css: "ui-monospace, monospace" },
] as const;
```

Google list (exact names for the CSS API): Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Playfair Display, Merriweather, Nunito, Oswald, Raleway, Source Sans 3, Rubik, Work Sans, PT Serif, Ubuntu, Nunito Sans, DM Sans, Outfit, Libre Baskerville.

`fontFamilyCss`: if id matches `SITE_FONT_OPTIONS`, use that `css`; if Google, return `"${family}", sans-serif`; else `inherit`.

`collectGoogleFonts`: unique families from every appearance snapshot’s `typography.fontFamily` where `isGoogleFont`. Weights: include `400` plus any `fontWeight` used on those snapshots (skip `""`). Always add `700` if any heading exists using that family (or always include 400 and 700 to keep it simple — include 400 and 700 plus used weights).

URL:

```ts
export function googleFontsStylesheetUrl(fonts: { family: string; weights: string[] }[]): string | null {
  if (fonts.length === 0) {
    return null;
  }
  const query = fonts
    .map((font) => {
      const family = font.family.replace(/ /g, "+");
      const weights = [...new Set(font.weights)].sort().join(";");
      return `family=${family}:wght@${weights}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}
```

- [ ] **Step 1: Write tests** for URL encoding (`Open Sans` → `Open+Sans`) and collection from a layout with `fontFamily: "Roboto"` on `appearance.lg`.

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement `src/lib/google-fonts.ts`**

- [ ] **Step 4: Run `src/lib/google-fonts.test.ts` — expect PASS**

Use `widgetCssVars` / `widgetAppearanceStyle` `fontFamily` via `fontFamilyCss` (Task 4 may hardcode; this task switch those helpers to call `fontFamilyCss`).

- [ ] **Step 5: Commit** — skip unless asked.

---

### Task 6: Inspector breakpoint bar, reset, clone-on-edit patches

**Files:**
- Modify: `src/components/admin/WidgetInspector.tsx`
- Modify: `src/components/admin/TemplateLayoutBuilder.tsx` (optional: keep canvas XS–2XL bar; it already shares `previewBreakpoint`)

**Interfaces:**
- Consumes: `setAppearance`, `resetAppearance`, `resolvedAppearance`, `GRID_BREAKPOINTS`
- Produces: inspector header switcher; all style/advanced/content extras use `previewBreakpoint`

- [ ] **Step 1: No new unit test** (UI). Manual check listed in Step 4.

- [ ] **Step 2: Skip**

- [ ] **Step 3: Implement**

At the top of the inspector (below the widget type / Delete row, above Content/Style/Advanced tabs), render the same XS–2XL buttons as the canvas. Call `onPreviewBreakpoint`. If `previewBreakpoint !== "lg"` and `!widget.appearance[previewBreakpoint]`, show text: `Inheriting from a larger screen`. If a snapshot exists and breakpoint is not LG, show `Reset this screen size` that calls `onChange({ ...widget, appearance: resetAppearance(widget.appearance, previewBreakpoint) })`. If breakpoint is LG, the reset button label is `Reset to defaults` and calls `resetAppearance(appearance, "lg")`.

Remove the duplicate Screen size control from `GridFields` (grid columns/rows/gap still live in Content, but they use the header switcher). `GridFields` `setSize` stays clone-on-edit for `widget.sizes` via `{ ...resolved, ...patch }` stored at `previewBreakpoint`. Add `Reset this screen size` for grid sizes: delete `sizes[previewBreakpoint]` when not LG; when LG, set `sizes: { lg: defaultGridSize() }` and drop other keys only if you are resetting appearance — **do not** wipe other breakpoints’ grid sizes when resetting typography. Grid reset is its own button in GridFields: `Reset grid for this screen size`.

Every existing style/advanced control writes through `setAppearance(widget.appearance, previewBreakpoint, patch)`.

Load Google fonts in the builder: in `TemplateLayoutBuilder`, if `googleFontsStylesheetUrl(collectGoogleFonts(layout))` is non-null, render `<link rel="stylesheet" href={url} />`.

- [ ] **Step 4: Verify**

`npx tsc --noEmit`. Manual: select a heading, set color at LG, switch to SM — color still shows (inheriting). Change SM color, switch to LG — LG unchanged. Reset SM — inherits again.

- [ ] **Step 5: Commit** — skip unless asked.

---

### Task 7: Typography, border, radius, box shadow fields

**Files:**
- Modify: `src/components/admin/WidgetInspector.tsx`

**Interfaces:**
- Consumes: typography/border/shadow types, `SITE_FONT_OPTIONS`, `GOOGLE_FONT_NAMES`, `fontFamilyCss`
- Produces: Style tab sections

Show typography when `widget.type` is `heading` | `text` | `button` | `icon` | `spec-list`.

Typography controls (all patch `typography` via `setAppearance`):

1. Font family `<select>`: site options, then optgroup “Google” with `GOOGLE_FONT_NAMES`. Optional filter input that filters the Google list as the user types.
2. Font size: number + unit select (`px|em|rem|vw`). Empty number stores `fontSize: null`. Clamp 8–200.
3. Weight: select `Default` plus 100–900.
4. Transform, style, decoration: selects.
5. Line height: number + unit (`—` for unitless, `px`, `em`). Empty → `null`.
6. Letter spacing and word spacing: number + `px|em`. Empty → `null`.

Border: width 0–40, style select, color (`ColorField`), radius 0–80.

Shadow: checkbox Enabled; x, y, blur, spread; color; inset checkbox. Disabled shadow → `box-shadow: none` in CSS vars.

- [ ] **Step 1–2: Skip automated UI test**

- [ ] **Step 3: Implement the fields in `StyleFields`** above alignment/colors.

- [ ] **Step 4: `npx tsc --noEmit`**. Manual: change heading size at LG, switch to XS — size inherits; change XS size; public-style canvas preview updates (Task 8 if canvas still uses old inline).

- [ ] **Step 5: Commit** — skip unless asked.

---

### Task 8: Canvas preview uses resolved appearance; fonts on public view

**Files:**
- Modify: `src/components/admin/TemplateLayoutBuilder.tsx`
- Modify: `src/components/TemplateLayoutView.tsx`
- Modify: `src/components/ProductDataTabs.tsx` only if the font `<link>` should live higher — prefer putting the `<link>` inside `TemplateLayoutView` so every public template gets fonts.

**Interfaces:**
- Consumes: `widgetAppearanceStyle`, `resolvedAppearance`, `googleFontsStylesheetUrl`, `collectGoogleFonts`

- [ ] **Step 3: Implement**

Canvas widget wrappers: `style={widgetAppearanceStyle(resolvedAppearance(widget.appearance, previewBreakpoint))}` instead of `widgetFrameStyle`. Same for grid children. Image preview uses `imageSizeStyle(resolvedAppearance(...))`. Spacer preview height from `resolved.spacerHeight`. Icon glyph size from `resolved.iconSize`. Button preview classes from `resolved.buttonStyle`.

`TemplateLayoutView`: at the top, `const href = googleFontsStylesheetUrl(collectGoogleFonts(layout));` then `{href ? <link rel="stylesheet" href={href} /> : null}`.

- [ ] **Step 4: `npx tsc --noEmit`** and all node tests.

- [ ] **Step 5: Commit** — skip unless asked.

---

### Task 9: Final verification

**Files:** none new.

- [ ] **Step 1: Run tests**

```bash
export PATH="/Users/zakir/.local/node/bin:$PATH"
node --experimental-strip-types --test src/lib/template-layout.test.ts src/lib/google-fonts.test.ts
npx tsc --noEmit
```

Expected: all tests PASS, tsc clean.

- [ ] **Step 2: Manual checklist**

- Edit template: heading typography at LG visible on canvas at every screen until SM is changed.
- SM font size does not change LG.
- XL font size does not change LG or SM.
- Grid: decrease rows still shrinks cells; LG columns inherit down until a smaller size is set.
- Border, radius, shadow render on canvas and on a product page that uses the template.
- Google font (e.g. Poppins) loads on admin and on the public product tab.
- Legacy template with only `frame` still opens and looks aligned/colored.
- Legacy grid with `sizes.base` 2×2 and `sizes.lg` 4×4 still shows 2×2 below desktop and 4×4 at desktop.

- [ ] **Step 3: Commit** — skip unless asked.

---

## Spec coverage

| Spec section | Task |
| --- | --- |
| Desktop-down cascade + examples | 1 |
| Grid same cascade + migrate old mobile-up | 2 |
| Appearance data model, extras, heading tag | 3 |
| Inspector switcher, inherit, reset, clone-on-edit | 6 |
| Typography / border / shadow UI | 7 |
| Public CSS vars + media queries | 4, 2 |
| Canvas inline resolver | 8 |
| Google Fonts picker + stylesheet | 5, 7, 8 |
| Frame → appearance migrate | 3 |
| Validation clamps | 3 |
| Tests listed in spec | 1, 2, 3, existing cell tests |
| Out of scope (hover, etc.) | not implemented |
