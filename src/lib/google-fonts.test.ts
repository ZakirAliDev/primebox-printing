import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canAddCustomFont,
  collectGoogleFonts,
  collectGoogleFontsFromFamilies,
  filterFontOptions,
  fontFamilyCss,
  GOOGLE_FONT_NAMES,
  googleFontsStylesheetUrl,
  isGoogleFont,
  sanitizeFontFamily,
  SITE_FONT_OPTIONS,
} from "./google-fonts.ts";
import { defaultAppearance, type TemplateSection } from "./template-layout.ts";

test("exports the configured site and Google font options", () => {
  assert.equal(SITE_FONT_OPTIONS.find((option) => option.id === "sans")?.css, "var(--font-sans), Helvetica, Arial, sans-serif");
  assert.ok(GOOGLE_FONT_NAMES.length >= 1000);
  assert.ok(isGoogleFont("Open Sans"));
  assert.ok(isGoogleFont("ABeeZee"));
  assert.ok(isGoogleFont("Zilla Slab Highlight"));
  assert.equal(isGoogleFont("sans"), false);
});

test("fontFamilyCss resolves site ids, Google families, and custom names", () => {
  assert.equal(fontFamilyCss(""), "inherit");
  assert.equal(fontFamilyCss("serif"), "Georgia, 'Times New Roman', serif");
  assert.equal(fontFamilyCss("Roboto"), '"Roboto", sans-serif');
  assert.equal(fontFamilyCss("Comic Sans MS"), '"Comic Sans MS", sans-serif');
});

test("sanitizeFontFamily strips CSS-breaking characters", () => {
  assert.equal(sanitizeFontFamily('  "Evil"; background:url(x)  '), "Evil background:url(x)");
  assert.equal(sanitizeFontFamily(""), "");
});

test("filterFontOptions live-searches site, custom, and Google families", () => {
  const results = filterFontOptions("roboto", ["Company Serif"]);
  assert.ok(results.some((option) => option.id === "Roboto" && option.group === "google"));
  assert.equal(
    results.find((option) => option.group === "custom")?.id,
    undefined,
  );

  const custom = filterFontOptions("company", ["Company Serif"]);
  assert.deepEqual(
    custom.filter((option) => option.group === "custom").map((option) => option.id),
    ["Company Serif"],
  );

  const site = filterFontOptions("sans");
  assert.ok(site.some((option) => option.id === "sans" && option.group === "site"));
});

test("canAddCustomFont allows new names that are not site or Google families", () => {
  assert.equal(canAddCustomFont("Roboto", []), false);
  assert.equal(canAddCustomFont("sans", []), false);
  assert.equal(canAddCustomFont("Company Serif", ["Company Serif"]), false);
  assert.equal(canAddCustomFont("Company Serif", []), true);
});

test("collectGoogleFontsFromFamilies ignores site and custom names", () => {
  assert.deepEqual(collectGoogleFontsFromFamilies(["sans", "Roboto", "Company Serif", "Roboto"]), [
    { family: "Roboto", weights: ["400", "700", "900"] },
  ]);
});

test("collectGoogleFonts finds Roboto from appearance.lg", () => {
  const robotoAppearance = {
    ...defaultAppearance(),
    typography: {
      ...defaultAppearance().typography,
      fontFamily: "Roboto",
      fontWeight: "500" as const,
    },
  };
  const layout: TemplateSection[] = [
    {
      id: "section",
      columns: [
        {
          id: "column",
          span: 12,
          widgets: [
            {
              id: "heading",
              type: "heading",
              tag: "h2",
              text: "Heading",
              appearance: { lg: robotoAppearance },
            },
          ],
        },
      ],
    },
  ];

  assert.deepEqual(collectGoogleFonts(layout), [{ family: "Roboto", weights: ["400", "500", "700"] }]);
});

test("collectGoogleFonts walks grid cell widgets", () => {
  const openSansAppearance = {
    ...defaultAppearance(),
    typography: {
      ...defaultAppearance().typography,
      fontFamily: "Open Sans",
      fontWeight: "600" as const,
    },
  };
  const layout: TemplateSection[] = [
    {
      id: "section",
      columns: [
        {
          id: "column",
          span: 12,
          widgets: [
            {
              id: "grid",
              type: "grid",
              appearance: { lg: defaultAppearance() },
              sizes: {},
              cells: [
                {
                  id: "cell",
                  widgets: [
                    {
                      id: "text",
                      type: "text",
                      html: "<p>Nested</p>",
                      appearance: { lg: openSansAppearance },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  assert.deepEqual(collectGoogleFonts(layout), [{ family: "Open Sans", weights: ["400", "600", "700"] }]);
});

test("googleFontsStylesheetUrl encodes Open Sans as Open+Sans", () => {
  assert.equal(
    googleFontsStylesheetUrl([{ family: "Open Sans", weights: ["700", "400", "700"] }]),
    "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap",
  );
  assert.equal(googleFontsStylesheetUrl([]), null);
});
