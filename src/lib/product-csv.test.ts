import assert from "node:assert/strict";
import test from "node:test";
import { parseCsv, parseProductCsv, resolveCategorySlugs } from "./product-csv.ts";

test("parseCsv keeps quoted commas and escaped quotes", () => {
  const rows = parseCsv('name,summary\n"Gift, Boxes","He said ""hello"""\n');
  assert.deepEqual(rows[1], ["Gift, Boxes", 'He said "hello"']);
});

test("parseProductCsv maps WooCommerce headers and Parent > Child categories", () => {
  const csv = [
    "Name,SKU,Short description,Description,Categories,Images,Published",
    'Perfume Box,perfume-box,"Short copy","<p>Long</p>","Cosmetic Boxes > Perfume","https://a.test/1.jpg, https://a.test/2.jpg",1',
  ].join("\n");
  const parsed = parseProductCsv(csv);
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].name, "Perfume Box");
  assert.equal(parsed.rows[0].slug, "perfume-box");
  assert.equal(parsed.rows[0].summary, "Short copy");
  assert.equal(parsed.rows[0].body, "<p>Long</p>");
  assert.equal(parsed.rows[0].image, "https://a.test/1.jpg");
  assert.deepEqual(parsed.rows[0].gallery, ["https://a.test/2.jpg"]);
  assert.deepEqual(parsed.rows[0].categoryValues, ["Perfume"]);
});

test("parseProductCsv skips unpublished Woo rows", () => {
  const csv = "Name,SKU,Published\nDraft Box,draft-box,-1\nLive Box,live-box,1\n";
  const parsed = parseProductCsv(csv);
  assert.equal(parsed.rows[0].skip, "Skipped unpublished product.");
  assert.equal(parsed.rows[1].skip, "");
});

test("resolveCategorySlugs matches names and slugs", () => {
  const categories = [
    { slug: "gift-boxes", name: "Gift Boxes" },
    { slug: "cosmetic-boxes", name: "Cosmetic Boxes" },
  ];
  const next = resolveCategorySlugs(["Gift Boxes", "cosmetic-boxes", "Unknown"], categories);
  assert.deepEqual(next.slugs, ["gift-boxes", "cosmetic-boxes"]);
  assert.deepEqual(next.unknown, ["Unknown"]);
});
