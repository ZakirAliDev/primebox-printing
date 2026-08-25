import assert from "node:assert/strict";
import test from "node:test";
import {
  createTrustBarSlide,
  normalizeTrustBarSettings,
  trustBarHasContent,
  trustBarMarqueeDurationMs,
  trustBarMarqueeSet,
} from "./trust-bar";

test("normalizeTrustBarSettings keeps two still slots and drops empty carousel slides", () => {
  const next = normalizeTrustBarSettings({
    stills: [
      { id: "a", image: "/a.png", href: "https://a.example", alt: "A" },
      { id: "b", image: "", href: "", alt: "" },
    ],
    carousel: {
      slides: [
        { id: "c1", image: "/c1.png", href: "", alt: "C1" },
        { id: "c2", image: "", href: "https://x", alt: "empty" },
      ],
      autoplay: false,
      autoplayMs: 999,
      slidesToShowDesktop: 20,
      slidesToShowMobile: 0,
    },
  });

  assert.equal(next.stills.length, 2);
  assert.equal(next.stills[0].image, "/a.png");
  assert.equal(next.stills[1].image, "");
  assert.equal(next.carousel.slides.length, 1);
  assert.equal(next.carousel.slides[0].image, "/c1.png");
  assert.equal(next.carousel.autoplay, false);
  assert.equal(next.carousel.autoplayMs, 1000);
  assert.equal(next.carousel.slidesToShowDesktop, 12);
  assert.equal(next.carousel.slidesToShowMobile, 1);
  assert.equal(next.stillHeight, 64);
  assert.equal(next.slideHeight, 64);
});

test("trustBarHasContent reflects stills and carousel", () => {
  assert.equal(trustBarHasContent(normalizeTrustBarSettings()), false);
  assert.equal(
    trustBarHasContent(
      normalizeTrustBarSettings({
        stills: [createTrustBarSlide({ image: "/x.png" }), createTrustBarSlide()],
      }),
    ),
    true,
  );
  assert.equal(
    trustBarHasContent(
      normalizeTrustBarSettings({
        carousel: {
          slides: [createTrustBarSlide({ image: "/y.png" })],
          autoplay: true,
          autoplayMs: 5000,
          slidesToShowDesktop: 7,
          slidesToShowMobile: 3,
        },
      }),
    ),
    true,
  );
});

test("trustBarMarqueeSet fills at least one viewport without dropping unique slides", () => {
  assert.deepEqual(trustBarMarqueeSet([], 7), []);
  assert.equal(trustBarMarqueeSet(["a"], 7).length, 7);
  assert.deepEqual(trustBarMarqueeSet(["a", "b", "c"], 2), ["a", "b", "c"]);
  assert.equal(trustBarMarqueeSet(["a", "b", "c"], 7).length, 9);
});

test("trustBarMarqueeDurationMs scales with slide count", () => {
  assert.equal(trustBarMarqueeDurationMs(1, 5000), 1667);
  assert.equal(trustBarMarqueeDurationMs(6, 5000), 10002);
});
