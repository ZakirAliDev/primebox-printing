# Shop by industry section

Date: 2026-08-22

## Goal

Rebuild the home “Shop by industry” section with distinct category cards (not product cards) that show category images, and let admins choose which categories appear from Site Settings.

## Behavior

- Split card: image left (~42%), name + summary + “Explore →” on the right
- Stacks image-above-text on small screens
- Distinct from `ProductCard` (no Customize overlay, horizontal layout)
- Empty category image → placeholder with name
- No selected categories → section hidden on home

## Admin

Site Settings → Shop by industry:
- Title + supporting text
- Search/add categories, reorder, remove
- Save / Reset

## Data

`siteSettings.shopByIndustry`: `{ title, subtitle, categorySlugs: string[] }`
