# Responsive widget typography and style

Date: 2026-08-20

## Goal

Give every template widget Elementor-like typography, border, radius, and box shadow, and make **all appearance settings** (including grid columns/rows/gap, image size, spacer height, and button look) follow screen size. Content stays shared. Larger-screen values apply to smaller screens until a smaller screen is changed. Desktop (LG) is the default and also applies to XL/2XL until those are changed.

## Locked decisions

- Content (heading text, TinyMCE HTML, image `src`/`alt`, button label/href, icon name/label, spec-list rows, grid cells) is **not** per breakpoint.
- Font family: site fonts plus a Google Fonts picker (searchable common families).
- This pass: typography + border + radius + box shadow, and make every existing appearance control responsive.
- Out of scope: hover states, CSS filters, blend modes, motion, per-breakpoint content.

## Breakpoints

Keep the existing six IDs and widths:

| ID | Label | Short | Min width |
| --- | --- | --- | --- |
| `base` | Mobile | XS | 0 |
| `sm` | Small | SM | 640 |
| `md` | Medium | MD | 768 |
| `lg` | Large | LG | 1024 |
| `xl` | Extra large | XL | 1280 |
| `2xl` | 2X large | 2XL | 1536 |

`base` remains the XS key (no rename). **LG is the cascade default**, not `base`.

## Cascade

Clone-on-edit: the first edit at a non-LG size writes a full snapshot of the resolved style at that size, then applies the change. Later edits patch that snapshot. **Reset this screen size** deletes the snapshot (disabled behavior on LG is “restore widget factory defaults,” not delete).

**Resolve at breakpoint P:**

1. Start from widget factory defaults merged with `appearance.lg` (required).
2. If P is smaller than LG (`md`, `sm`, `base`): walk `md` → `sm` → `base` and merge each defined snapshot whose breakpoint is **at or above P** (closer to LG first).
3. If P is larger than LG (`xl`, `2xl`): walk `xl` → `2xl` and merge each defined snapshot whose breakpoint is **at or below P**.

Same resolver is used for grid `sizes`.

**Examples**

- Font 24px at LG only → every size is 24px.
- Then 16px at SM → LG and MD stay 24px; SM and XS are 16px.
- Then 20px at XL → XL and 2XL are 20px; LG/MD stay 24px; SM/XS stay 16px.

Grid columns/rows/gap use this same rule. The canvas preview breakpoint switcher and the inspector switcher stay in sync.

## Data model

Content stays on the widget root. Appearance moves off the single `frame` object.

```ts
appearance: Partial<Record<GridBreakpointId, WidgetAppearance>>
// appearance.lg is always present after normalize
```

`WidgetAppearance` (all fields optional inside a non-LG snapshot; LG stores a full object):

**Chrome (every widget)**

- `align`, `color`, `background`
- `margin`, `padding` (four-side px, existing shape)
- `border`: width (px), style (`none` | `solid` | `dashed` | `dotted`), color
- `radius` (px, one value)
- `shadow`: enabled, x, y, blur, spread (px), color, inset boolean

**Typography** (heading, text, button, icon, spec-list only; omitted on image, spacer, grid shell)

- `fontFamily`: empty = inherit site font; otherwise a stack key or Google family name
- `fontSize`: `{ value, unit }` units `px` | `em` | `rem` | `vw`
- `fontWeight`: `""` | `100`–`900`
- `textTransform`: `none` | `uppercase` | `lowercase` | `capitalize`
- `fontStyle`: `normal` | `italic`
- `textDecoration`: `none` | `underline` | `line-through`
- `lineHeight`: `{ value, unit }` units `""` (unitless) | `px` | `em`
- `letterSpacing`, `wordSpacing`: `{ value, unit }` units `px` | `em`

Empty color / family / size means theme default (inherit), not a forced black or zero.

**Widget extras** (stored on the same snapshot)

- Image: `sizeMode`, `objectFit`, `objectPosition`, `width`, `widthUnit`, `height`, `heightUnit`
- Spacer: `height`, `divider`
- Button: `style` (`yellow` | `navy` | `outline`)
- Icon: `iconSize` (px) for the icon glyph; label uses typography
- Grid: `columns`, `rows`, `gap` stay on `widget.sizes` (existing), but cascade flips to LG-default as above

Heading `tag` stays content (SEO/semantic), not a breakpoint style. Visual size comes from typography.

## Inspector

- XS–2XL switcher at the **top of the widget inspector**, visible on Content, Style, and Advanced. Default screen: **LG**.
- Show “inheriting” when the current size has no snapshot. **Reset this screen size** on non-LG when a snapshot exists.
- **Style:** typography (text widgets only), alignment, colors, border, radius, box shadow.
- **Advanced:** margin, padding (per current screen size).
- **Content:** shared fields, plus responsive extras that already live there (image size/fit, spacer height, button look, grid columns/rows/gap) bound to the same switcher.

## Public render and admin canvas

Widget wrapper (and grid wrapper) emit CSS variables for the **resolved** style at every breakpoint (always fully resolved, not partial).

`globals.css`:

- Unscoped rule = LG
- `max-width: 1023px` = MD
- `max-width: 767px` = SM
- `max-width: 639px` = XS/`base`
- `min-width: 1280px` = XL
- `min-width: 1536px` = 2XL

Admin canvas uses the same resolver with the selected preview breakpoint as inline styles (no need to resize the browser).

Typography on the wrapper inherits into children. TinyMCE inline font tags in saved HTML remain content and may override the widget. Heading Tailwind size classes from `tag` are removed in favor of typography (tag still picks the HTML element).

## Google Fonts

- Picker: site sans / serif / mono / inherit, plus a searchable curated Google list (no API key).
- Persist the family name string.
- Collect unique Google families (and weights actually used) from the layout; inject one `fonts.googleapis.com` stylesheet on the public template view and in the admin builder.
- If the network font fails, fall back to the site sans.

## Migration on read (`normalizeWidget` / `normalizeGridSizes`)

**Frame → appearance**

- Copy existing `frame` and current image/spacer/button fields into `appearance.lg`.
- Keep accepting legacy `frame` on disk; after normalize, runtime widgets always have `appearance`.

**Grid cascade**

Old grids were mobile-up (`base` flowed to larger sizes). To keep the same pixels:

1. Compute `oldResolved` at all six breakpoints with the current mobile-up function.
2. Set `sizes.lg = oldResolved.lg`.
3. Walk `md` → `sm` → `base`. If `oldResolved[bp]` differs from the new downward cascade so far, write a snapshot.
4. Walk `xl` → `2xl` the same way upward.

Do not rewrite catalog JSON except when the user saves a template.

## Validation

Clamp using existing ranges: grid 1–12, gap 0–80, spacing 0–200, font size 8–200, line-height 0.8–3 (unitless) or 8–200 (px), letter/word spacing −20–40, radius 0–80, shadow lengths 0–80, spacer height 8–160.

## Tests

Run with `node --experimental-strip-types --test` (exclude `**/*.test.ts` from `tsconfig` as already done).

- Cascade: LG-only applies everywhere; SM override applies to SM+XS only; XL override applies to XL+2XL only.
- Grid migration: `base` 2×2 + `lg` 4×4 still renders 2×2 below LG and 4×4 at LG and up.
- `ensureGridCells` still shrinks when the max cell count drops.
- `visibleGridCells` still slices to the current columns × rows.

## Files (implementation, not this spec)

- `src/lib/template-layout.ts` — types, defaults, resolvers, CSS vars, normalize/migrate
- `src/lib/google-fonts.ts` — curated list, URL builder, family collection
- `src/components/admin/WidgetInspector.tsx` — switcher, typography, border, shadow
- `src/components/admin/TemplateLayoutBuilder.tsx` — preview uses resolver
- `src/components/TemplateLayoutView.tsx` — CSS vars + font link
- `src/app/globals.css` — desktop-down media queries for widget + grid
- `src/lib/template-layout.test.ts` — cascade, migrate, cells
