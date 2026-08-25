import assert from "node:assert/strict";
import { test } from "node:test";
import {
  relatedLoopBounds,
  relatedLoopItems,
  relatedSnapLoopIndex,
  uniqueRelatedItems,
} from "./related-carousel.ts";

const items = [
  { slug: "a" },
  { slug: "b" },
  { slug: "c" },
  { slug: "d" },
];

test("uniqueRelatedItems drops duplicate slugs", () => {
  assert.deepEqual(
    uniqueRelatedItems([{ slug: "a" }, { slug: "b" }, { slug: "a" }, { slug: "b" }]).map((item) => item.slug),
    ["a", "b"],
  );
});

test("relatedLoopItems clones both ends for infinite scrolling", () => {
  const looped = relatedLoopItems(items, 3);
  assert.equal(looped.length, items.length + 6);
  assert.equal(looped[0].slug, "b");
  assert.equal(looped[3].slug, "a");
  assert.equal(looped[looped.length - 1].slug, "c");
});

test("relatedSnapLoopIndex wraps forward and backward", () => {
  const visible = 3;
  const { min, max } = relatedLoopBounds(items, visible);
  assert.equal(relatedSnapLoopIndex(max + 1, items, visible), min);
  assert.equal(relatedSnapLoopIndex(min - 1, items, visible), max);
});

test("relatedLoopItems never repeats products when the list is short", () => {
  const shortItems = [{ slug: "a" }, { slug: "b" }, { slug: "a" }];
  const visible = 3;
  const looped = relatedLoopItems(shortItems, visible);
  assert.deepEqual(
    looped.map((item) => item.slug),
    ["a", "b"],
  );
  assert.equal(relatedSnapLoopIndex(1, shortItems, visible), 0);
  assert.deepEqual(relatedLoopBounds(shortItems, visible), { start: 0, min: 0, max: 0 });
});
