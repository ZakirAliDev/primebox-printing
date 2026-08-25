import assert from "node:assert/strict";
import test from "node:test";
import { normalizeFeaturedCategorySettings } from "./featured-category";

test("normalizeFeaturedCategorySettings clamps slides and keeps a valid category slug", () => {
  const next = normalizeFeaturedCategorySettings({
    categorySlug: "  retail-packaging  ",
    autoplay: false,
    autoplayMs: 200,
    slides: { base: 0, sm: 9, md: 3, lg: 4, xl: 5 },
  });

  assert.equal(next.categorySlug, "retail-packaging");
  assert.equal(next.autoplay, false);
  assert.equal(next.autoplayMs, 1000);
  assert.equal(next.slides.base, 1);
  assert.equal(next.slides.sm, 6);
});

test("normalizeFeaturedCategorySettings allows an empty category slug", () => {
  const next = normalizeFeaturedCategorySettings({});
  assert.equal(next.categorySlug, "");
});
