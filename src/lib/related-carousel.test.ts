import assert from "node:assert/strict";
import { test } from "node:test";
import {
  relatedLoopBounds,
  relatedLoopItems,
  relatedSnapLoopIndex,
} from "./related-carousel.ts";

const items = [
  { slug: "a" },
  { slug: "b" },
  { slug: "c" },
  { slug: "d" },
];

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

test("relatedLoopItems repeats short lists so the viewport stays filled", () => {
  const shortItems = [{ slug: "a" }, { slug: "b" }];
  const visible = 3;
  const looped = relatedLoopItems(shortItems, visible);
  assert.ok(looped.length >= visible + shortItems.length + visible);
  assert.equal(relatedSnapLoopIndex(relatedLoopBounds(shortItems, visible).max + 1, shortItems, visible), relatedLoopBounds(shortItems, visible).min);
});
