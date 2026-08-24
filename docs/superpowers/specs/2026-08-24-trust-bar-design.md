# Trust / Logo Bar + Site Settings Tabs

## Goal

Rebuild the under-hero trust/logo bar from [primeboxprinting.com](https://primeboxprinting.com/) in the Next.js storefront, with admin controls for the two still images and the logo carousel. Reorganize Site Settings into **Global** and **Home** tabs.

## Live-site reference

Observed layout immediately under the hero:

- **Left column:** two still images (Trustpilot, Google Reviews), each optionally linked
- **Right column:** infinite image carousel of brand logos (autoplay, no arrows, pause on hover)
- Desktop shows multiple logos; mobile shows fewer

## Home page section order

1. Hero
2. **Trust / logo bar** (new)
3. Hardcoded intro text (“Custom & Graphic Packaging Solutions…”) — not admin-editable
4. Shop by industry
5. Quote form

## Layout & behavior

### Desktop

- Two columns inside the content width
- Left: two still images side by side
- Right: logo carousel filling remaining width

### Mobile

- Stills on top (side by side)
- Carousel below

### Carousel behavior

- Infinite loop when there is at least one slide
- Autoplay controllable from admin
- No visible arrow buttons (match live site)
- Pause on hover
- Visible slide counts configurable for desktop and mobile

### Visibility

- Skip empty still slots and empty carousel slides
- Hide the entire section if both stills are empty **and** the carousel has no slides

### Links

- Each still: optional URL (open in same tab or new tab as existing site link patterns dictate; prefer `target="_blank"` + `rel="noopener noreferrer"` for external review links)
- Each carousel slide: optional URL with the same link rules
- If `href` is empty, render image only (not wrapped in a link)

## Data model

Add `siteSettings.trustBar`:

```ts
type TrustBarImage = {
  image: string;
  href: string;
  alt: string;
};

type TrustBarSettings = {
  stills: [TrustBarImage, TrustBarImage]; // exactly two slots
  carousel: {
    slides: TrustBarImage[];
    autoplay: boolean;
    autoplayMs: number;
    slidesToShowDesktop: number;
    slidesToShowMobile: number;
  };
};
```

### Defaults / normalization

- File: `src/lib/trust-bar.ts`
- Provide `DEFAULT_TRUST_BAR_SETTINGS`, `createTrustBarSlide()`, `normalizeTrustBarSettings()`
- Clamp autoplay interval and slides-to-show to safe ranges
- Coerce missing/partial catalog data into a valid shape (same pattern as promo bar / shop by industry)

## Admin UI

### Site Settings tabs

Two tabs on `/admin/settings`:

| Tab | Contents |
|-----|----------|
| **Global settings** | Brand identity, logos (including separate footer logo), color scheme, promo bar |
| **Home page settings** | Hero carousel, trust/logo bar editor, shop by industry |

Keep the existing sticky right sidebar pattern only where it still fits; prefer putting Brand identity + Color scheme in the Global tab (sidebar or stacked boxes as space allows). Home tab focuses on home-only editors.

### Trust bar editor (`TrustBarEditor`)

- Still image 1 / 2: upload, clear, optional URL, alt text
- Carousel slides: add, remove, reorder, upload, optional URL, alt text
- Controls: autoplay toggle, interval (ms), slides to show (desktop), slides to show (mobile)
- Save / Reset for this block (same immediate-save style as promo/hero)

Reuse the existing admin media upload helper used for hero/logo uploads.

## Storefront implementation

### New files

- `src/lib/trust-bar.ts` — types, defaults, normalize helpers
- `src/components/TrustBar.tsx` — two-column section + carousel
- `src/components/admin/TrustBarEditor.tsx` — admin editor

### Updated files

- `src/lib/catalog.ts` — add `trustBar` to `SiteSettings` + normalize
- `src/data/catalog.json` — persist default/empty `trustBar`
- `src/components/admin/SiteSettingsForm.tsx` — tabs + wire editor
- `src/app/(site)/page.tsx` — render `<TrustBar />` under `<HomeHero />`

### Carousel implementation notes

- Client component for autoplay / looping
- Prefer reusing infinite-loop helpers from promo/related carousel where they fit; otherwise a focused local loop for logo slides
- Respect `prefers-reduced-motion` (disable autoplay / hard transitions when reduced)

## Out of scope

- Editing the hardcoded intro text in admin
- Moving promo bar to Home tab
- Separate admin route for home settings
- Trustpilot/Google widget embeds (images + links only)

## Success criteria

- Home page shows a two-column trust/logo bar under the hero matching the live-site structure
- Admin can manage both stills and carousel slides (image + optional URL + alt) with full carousel controls
- Site Settings is split into Global and Home tabs with the agreed content split
- Empty configuration does not leave a broken empty section on the storefront
