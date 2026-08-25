import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_TESTIMONIAL_STAR_ICON,
  createHomeTestimonial,
  normalizeHomeTestimonialsSettings,
} from "./home-testimonials.ts";

test("normalizeHomeTestimonialsSettings seeds live reviews when empty", () => {
  const next = normalizeHomeTestimonialsSettings();
  assert.equal(next.starIcon, DEFAULT_TESTIMONIAL_STAR_ICON);
  assert.equal(next.items.length, 4);
  assert.equal(next.items[0].name, "Emma Willson");
});

test("normalizeHomeTestimonialsSettings drops blank rows and keeps a custom star icon", () => {
  const next = normalizeHomeTestimonialsSettings({
    starIcon: " /stars.png ",
    items: [
      { id: "a", name: "Alex", text: "Great boxes." },
      { id: "b", name: "  ", text: "   " },
    ],
  });
  assert.equal(next.starIcon, "/stars.png");
  assert.equal(next.items.length, 1);
  assert.equal(next.items[0].name, "Alex");
});

test("createHomeTestimonial assigns an id", () => {
  const next = createHomeTestimonial({ name: "Pat", text: "Fast delivery." });
  assert.match(next.id, /^review-/);
  assert.equal(next.name, "Pat");
});
