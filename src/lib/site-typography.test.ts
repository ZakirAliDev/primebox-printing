import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_SITE_TYPOGRAPHY,
  normalizeSiteTypography,
  siteTypographyCssVars,
} from "./site-typography.ts";

test("normalizeSiteTypography fills defaults", () => {
  const next = normalizeSiteTypography(null);
  assert.deepEqual(next.h1, DEFAULT_SITE_TYPOGRAPHY.h1);
  assert.deepEqual(next.paragraph, DEFAULT_SITE_TYPOGRAPHY.paragraph);
  assert.deepEqual(next.productCard, DEFAULT_SITE_TYPOGRAPHY.productCard);
  assert.deepEqual(next.categoryCard, DEFAULT_SITE_TYPOGRAPHY.categoryCard);
  assert.deepEqual(next.customFonts, []);
});

test("normalizeSiteTypography clamps sizes and sanitizes fonts", () => {
  const next = normalizeSiteTypography({
    h1: { fontFamily: "Roboto", fontSize: 400, lineHeight: 9, color: "#abc" },
    paragraph: { fontFamily: 'Evil"; color:red', fontSize: 2, lineHeight: 0.1, color: "nope" },
    productCard: { title: 2, body: 200 },
    categoryCard: { title: 18, body: 12 },
    customFonts: ["Roboto", "Comic Sans MS"],
  });
  assert.equal(next.h1.fontFamily, "Roboto");
  assert.equal(next.h1.fontSize, 96);
  assert.equal(next.h1.lineHeight, 3);
  assert.equal(next.h1.color, "#aabbcc");
  assert.equal(next.paragraph.fontFamily, "Evil color:red");
  assert.equal(next.paragraph.fontSize, 10);
  assert.equal(next.paragraph.lineHeight, 0.8);
  assert.equal(next.paragraph.color, DEFAULT_SITE_TYPOGRAPHY.paragraph.color);
  assert.equal(next.productCard.title, 10);
  assert.equal(next.productCard.body, 96);
  assert.equal(next.categoryCard.title, 18);
  assert.equal(next.categoryCard.body, 12);
  assert.deepEqual(next.customFonts, ["Comic Sans MS"]);
});

test("siteTypographyCssVars emits role variables", () => {
  const vars = siteTypographyCssVars(DEFAULT_SITE_TYPOGRAPHY);
  assert.equal(vars["--type-h1-fs"], "36px");
  assert.equal(vars["--type-paragraph-lh"], "1.6");
  assert.ok(vars["--type-h2-ff"]);
  assert.equal(vars["--type-h3-color"], "#12315a");
  assert.equal(vars["--type-product-card-title-fs"], "16px");
  assert.equal(vars["--type-category-card-body-fs"], "14px");
});
