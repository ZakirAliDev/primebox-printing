# Promo bar carousel

Date: 2026-08-22

## Goal

Add a text-only carousel to the center of the top header promo strip, configurable from Site Settings. Do not change the home hero carousel.

## Behavior

- Layout: Order in bulk (left) | promo carousel (center) | Sign In (right)
- Each slide is a single text string
- 1 slide: static text, no arrows, no autoplay, no loop
- 2+ slides: infinite loop, icon-only arrows (no circular button), optional autoplay
- Pause autoplay on hover; respect `prefers-reduced-motion`
- Center carousel hidden on very small screens (same as previous center text)

## Admin (Site Settings)

- Promo bar panel: add / remove / reorder slides, autoplay toggle, interval (ms)
- Empty text slides dropped on normalize/save
- Reset restores default single Labour Day slide

## Data

`siteSettings.promoBar`: `{ autoplay, autoplayMs, slides: [{ id, text }] }`
