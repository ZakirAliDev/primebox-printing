import assert from "node:assert/strict";
import { test } from "node:test";
import { HERO_SLIDES, heroLoopSlides, heroRealIndex, heroSnapIndex, normalizeHeroSettings } from "./hero-slides.ts";

test("heroLoopSlides clones first and last for infinite track", () => {
  const looped = heroLoopSlides(HERO_SLIDES);
  assert.equal(looped.length, HERO_SLIDES.length + 2);
  assert.equal(looped[0].id, HERO_SLIDES[HERO_SLIDES.length - 1].id);
  assert.equal(looped[1].id, HERO_SLIDES[0].id);
  assert.equal(looped[looped.length - 1].id, HERO_SLIDES[0].id);
});

test("heroRealIndex maps cloned positions back to real slides", () => {
  const length = HERO_SLIDES.length;
  assert.equal(heroRealIndex(1, length), 0);
  assert.equal(heroRealIndex(length, length), length - 1);
  assert.equal(heroRealIndex(0, length), length - 1);
  assert.equal(heroRealIndex(length + 1, length), 0);
});

test("heroSnapIndex jumps off clones without wrapping past the track", () => {
  const length = HERO_SLIDES.length;
  assert.equal(heroSnapIndex(0, length), length);
  assert.equal(heroSnapIndex(length + 1, length), 1);
  assert.equal(heroSnapIndex(2, length), 2);
});

test("normalizeHeroSettings fills defaults when hero is missing", () => {
  const settings = normalizeHeroSettings();
  assert.equal(settings.autoplay, true);
  assert.equal(settings.autoplayMs, 5000);
  assert.equal(settings.slides.length, HERO_SLIDES.length);
  assert.equal(settings.slides[0].buttonHref, "/quote");
  assert.equal(settings.typography.heading.fontSize, 55);
  assert.equal(settings.typography.heading.fontFamily, "sans");
  assert.equal(settings.typography.supporting.fontSize, 18);
  assert.equal(settings.typography.button.fontSize, 17);
  assert.equal(settings.background, "#ffffff");
  assert.equal(settings.backgroundImage, "");
  assert.equal(settings.height, 430);
  assert.equal(settings.arrowsOnHover, false);
  assert.equal(settings.paddingTop, 40);
  assert.equal(settings.paddingBottom, 40);
});

test("normalizeHeroSettings keeps Google and custom families", () => {
  const settings = normalizeHeroSettings({
    typography: {
      heading: { fontFamily: "Roboto", fontSize: 400 },
      supporting: { fontFamily: "serif", fontSize: 2 },
      button: { fontFamily: 'Acme"; color:red', fontSize: 17 },
    },
    customFonts: ["Company Serif", "Roboto", "  "],
  });
  assert.equal(settings.typography.heading.fontFamily, "Roboto");
  assert.equal(settings.typography.heading.fontSize, 96);
  assert.equal(settings.typography.supporting.fontFamily, "serif");
  assert.equal(settings.typography.supporting.fontSize, 10);
  assert.equal(settings.typography.button.fontFamily, "Acme color:red");
  assert.deepEqual(settings.customFonts, ["Company Serif", "Acme color:red"]);
});

test("normalizeHeroSettings keeps an empty slide list", () => {
  const settings = normalizeHeroSettings({ autoplay: false, autoplayMs: 50, slides: [] });
  assert.equal(settings.autoplay, false);
  assert.equal(settings.autoplayMs, 1000);
  assert.equal(settings.slides.length, 0);
});

test("normalizeHeroSettings clamps speeds and fills slide fields", () => {
  const settings = normalizeHeroSettings({
    transitionMs: 9000,
    slides: [{ heading: " New heading ", lines: ["One"] }],
  });
  assert.equal(settings.transitionMs, 2000);
  assert.equal(settings.slides[0].heading, "New heading");
  assert.equal(settings.slides[0].lines[1], "");
  assert.equal(settings.slides[0].buttonLabel, "Get Instant Quote");
});

test("normalizeHeroSettings keeps a valid carousel background", () => {
  const settings = normalizeHeroSettings({ background: "#12315A" });
  assert.equal(settings.background, "#12315a");
});

test("normalizeHeroSettings falls back when carousel background is invalid", () => {
  const settings = normalizeHeroSettings({ background: "red" });
  assert.equal(settings.background, "#ffffff");
});

test("normalizeHeroSettings keeps a carousel background image", () => {
  const settings = normalizeHeroSettings({ backgroundImage: " /hero/pattern.webp " });
  assert.equal(settings.backgroundImage, "/hero/pattern.webp");
});

test("normalizeHeroSettings clamps hero height and keeps arrows-on-hover", () => {
  const settings = normalizeHeroSettings({ height: 20, arrowsOnHover: true });
  assert.equal(settings.height, 200);
  assert.equal(settings.arrowsOnHover, true);
  assert.equal(normalizeHeroSettings({ height: 4000 }).height, 900);
});

test("normalizeHeroSettings clamps slide content padding", () => {
  const settings = normalizeHeroSettings({ paddingTop: -8, paddingBottom: 900 });
  assert.equal(settings.paddingTop, 0);
  assert.equal(settings.paddingBottom, 200);
});
