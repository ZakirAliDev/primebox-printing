"use client";

import { useRef, useState } from "react";
import { patchSiteSettingsAction } from "@/app/admin/actions";
import { ColorSchemeEditor } from "@/components/admin/ColorSchemeEditor";
import { HeroCarouselEditor } from "@/components/admin/HeroCarouselEditor";
import { PromoBarEditor } from "@/components/admin/PromoBarEditor";
import { ShopByIndustryEditor } from "@/components/admin/ShopByIndustryEditor";
import { FeaturedCategoryEditor } from "@/components/admin/FeaturedCategoryEditor";
import { TestimonialsEditor } from "@/components/admin/TestimonialsEditor";
import { TrustBarEditor } from "@/components/admin/TrustBarEditor";
import { TypographyEditor } from "@/components/admin/TypographyEditor";
import { AdminToast } from "@/components/admin/AdminNotice";
import { adminBox, adminBoxHead, adminGhost, adminMuted } from "@/components/admin/ui";
import { LOGO_HEIGHT_MAX, LOGO_HEIGHT_MIN, type Category, type SiteSettings } from "@/lib/catalog";
import { normalizeHeroSettings, type HeroSettings } from "@/lib/hero-slides";
import {
  DEFAULT_PROMO_BAR_SETTINGS,
  normalizePromoBarSettings,
  type PromoBarSettings,
} from "@/lib/promo-bar";
import {
  DEFAULT_SHOP_BY_INDUSTRY_SETTINGS,
  normalizeShopByIndustrySettings,
  type ShopByIndustrySettings,
} from "@/lib/shop-by-industry";
import {
  DEFAULT_FEATURED_CATEGORY_SETTINGS,
  normalizeFeaturedCategorySettings,
  type FeaturedCategorySettings,
} from "@/lib/featured-category";
import {
  DEFAULT_HOME_TESTIMONIALS_SETTINGS,
  normalizeHomeTestimonialsSettings,
  type HomeTestimonialsSettings,
} from "@/lib/home-testimonials";
import {
  DEFAULT_TRUST_BAR_SETTINGS,
  normalizeTrustBarSettings,
  type TrustBarSettings,
} from "@/lib/trust-bar";
import {
  DEFAULT_COLOR_SCHEME,
  DEFAULT_LINK_TRANSITION_MS,
  applyLinkedColor,
  normalizeHexColor,
  normalizeLinkTransitionMs,
  resolveColorScheme,
  type ColorScheme,
} from "@/lib/color-scheme";
import {
  DEFAULT_SITE_TYPOGRAPHY,
  normalizeSiteTypography,
  type SiteTypographySettings,
} from "@/lib/site-typography";

type SettingsTab = "global" | "home";

function LogoPlacement({
  label,
  checked,
  disabled,
  height,
  onToggle,
  onHeight,
  onHeightCommit,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  height: number;
  onToggle: () => void;
  onHeight: (value: number) => void;
  onHeightCommit: (value: number) => void;
}) {
  const setHeight = (raw: string) => {
    const next = Number(raw);
    if (!Number.isFinite(next)) {
      return;
    }
    onHeight(Math.min(LOGO_HEIGHT_MAX, Math.max(LOGO_HEIGHT_MIN, Math.round(next))));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-navy">
      <span className="w-14 shrink-0">{label}</span>
      <Switch checked={checked} disabled={disabled} label={`Use logo in ${label.toLowerCase()}`} onToggle={onToggle} />
      <span className="text-xs text-navy/55">Size</span>
      <div className="min-w-[72px] flex-1">
        <input
          type="range"
          min={LOGO_HEIGHT_MIN}
          max={LOGO_HEIGHT_MAX}
          value={height}
          disabled={disabled}
          aria-label={`${label} logo height`}
          className="inspector-range w-full"
          onChange={(event) => setHeight(event.target.value)}
          onPointerUp={(event) => onHeightCommit(Number(event.currentTarget.value))}
          onKeyUp={(event) => onHeightCommit(Number(event.currentTarget.value))}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-navy">{height}px</span>
    </div>
  );
}

function Switch({
  checked,
  disabled,
  label,
  onToggle,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
        checked ? "bg-yellow" : "bg-navy/20"
      }`}
      onClick={onToggle}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function SiteSettingsForm({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: Category[];
}) {
  const faviconRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const footerLogoRef = useRef<HTMLInputElement>(null);
  const [favicon, setFavicon] = useState(settings.favicon);
  const [logo, setLogo] = useState(settings.logo);
  const [logoInHeader, setLogoInHeader] = useState(settings.logoInHeader);
  const [logoInFooter, setLogoInFooter] = useState(settings.logoInFooter);
  const [logoHeaderHeight, setLogoHeaderHeight] = useState(settings.logoHeaderHeight);
  const [logoFooterHeight, setLogoFooterHeight] = useState(settings.logoFooterHeight);
  const [separateFooterLogo, setSeparateFooterLogo] = useState(settings.separateFooterLogo);
  const [footerLogo, setFooterLogo] = useState(settings.footerLogo);
  const savedHeaderHeight = useRef(settings.logoHeaderHeight);
  const savedFooterHeight = useRef(settings.logoFooterHeight);
  const [colors, setColors] = useState<ColorScheme>(() => resolveColorScheme(settings.colors));
  const [linkTransitionMs, setLinkTransitionMs] = useState(() =>
    normalizeLinkTransitionMs(settings.linkTransitionMs),
  );
  const [typography, setTypography] = useState<SiteTypographySettings>(() =>
    normalizeSiteTypography(settings.typography),
  );
  const [hero, setHero] = useState<HeroSettings>(() => normalizeHeroSettings(settings.hero));
  const [promoBar, setPromoBar] = useState<PromoBarSettings>(() =>
    normalizePromoBarSettings(settings.promoBar),
  );
  const [shopByIndustry, setShopByIndustry] = useState<ShopByIndustrySettings>(() =>
    normalizeShopByIndustrySettings(settings.shopByIndustry),
  );
  const [featuredCategory, setFeaturedCategory] = useState<FeaturedCategorySettings>(() =>
    normalizeFeaturedCategorySettings(settings.featuredCategory),
  );
  const [testimonials, setTestimonials] = useState<HomeTestimonialsSettings>(() =>
    normalizeHomeTestimonialsSettings(settings.testimonials),
  );
  const testimonialsRef = useRef(testimonials);
  testimonialsRef.current = testimonials;
  const [trustBar, setTrustBar] = useState<TrustBarSettings>(() =>
    normalizeTrustBarSettings(settings.trustBar),
  );
  const trustBarRef = useRef(trustBar);
  trustBarRef.current = trustBar;
  const [tab, setTab] = useState<SettingsTab>("global");
  const [busy, setBusy] = useState<
    | "favicon"
    | "logo"
    | "footerLogo"
    | "header"
    | "footer"
    | "colors"
    | "typography"
    | "hero"
    | "promoBar"
    | "shopByIndustry"
    | "featuredCategory"
    | "testimonials"
    | "trustBar"
    | ""
  >("");
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);

  const save = async (patch: Partial<SiteSettings>, key: typeof busy, onFail: () => void) => {
    if (busy) {
      return false;
    }
    setBusy(key);
    try {
      await patchSiteSettingsAction(patch);
      setNotice({ id: Date.now(), text: "Site settings saved." });
      return true;
    } catch {
      onFail();
      setNotice({ id: Date.now(), text: "Could not save. Try again." });
      return false;
    } finally {
      setBusy("");
    }
  };

  const upload = async (file: File, field: "favicon" | "logo" | "footerLogo") => {
    if (busy) {
      return;
    }
    setBusy(field);
    try {
      const data = new FormData();
      data.set("slug", "site");
      data.set("file", file);
      const response = await fetch("/admin/api/media", { method: "POST", body: data });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Upload failed.");
      }
      await patchSiteSettingsAction({ [field]: payload.url });
      if (field === "favicon") {
        setFavicon(payload.url);
      } else if (field === "logo") {
        setLogo(payload.url);
      } else {
        setFooterLogo(payload.url);
      }
      setNotice({
        id: Date.now(),
        text:
          field === "favicon"
            ? "Favicon saved."
            : field === "footerLogo"
              ? "Footer logo saved."
              : "Site logo saved.",
      });
    } catch (error) {
      setNotice({
        id: Date.now(),
        text: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setBusy("");
    }
  };

  const toggleHeader = () => {
    const next = !logoInHeader;
    setLogoInHeader(next);
    void save({ logoInHeader: next }, "header", () => setLogoInHeader(!next));
  };

  const toggleFooter = () => {
    const next = !logoInFooter;
    setLogoInFooter(next);
    void save({ logoInFooter: next }, "footer", () => setLogoInFooter(!next));
  };

  const toggleSeparateFooterLogo = () => {
    const next = !separateFooterLogo;
    setSeparateFooterLogo(next);
    void save({ separateFooterLogo: next }, "footer", () => setSeparateFooterLogo(!next));
  };

  const commitLogoHeight = (
    field: "logoHeaderHeight" | "logoFooterHeight",
    value: number,
    key: "header" | "footer",
    revert: (previous: number) => void,
  ) => {
    const saved = field === "logoHeaderHeight" ? savedHeaderHeight : savedFooterHeight;
    if (saved.current === value) {
      return;
    }
    const previous = saved.current;
    void save({ [field]: value }, key, () => revert(previous)).then((ok) => {
      if (ok) {
        saved.current = value;
      }
    });
  };

  const setColor = (key: keyof ColorScheme, value: string) => {
    const next = normalizeHexColor(value, colors[key]);
    setColors((current) => applyLinkedColor(current, key, next));
  };

  const saveColors = () => {
    const transition = normalizeLinkTransitionMs(linkTransitionMs);
    setLinkTransitionMs(transition);
    void save({ colors, linkTransitionMs: transition }, "colors", () => {
      setColors(settings.colors);
      setLinkTransitionMs(normalizeLinkTransitionMs(settings.linkTransitionMs));
    });
  };

  const resetColors = () => {
    const previousColors = colors;
    const previousTransition = linkTransitionMs;
    setColors(DEFAULT_COLOR_SCHEME);
    setLinkTransitionMs(DEFAULT_LINK_TRANSITION_MS);
    void save(
      { colors: DEFAULT_COLOR_SCHEME, linkTransitionMs: DEFAULT_LINK_TRANSITION_MS },
      "colors",
      () => {
        setColors(previousColors);
        setLinkTransitionMs(previousTransition);
      },
    );
  };

  const saveTypography = () => {
    const next = normalizeSiteTypography(typography);
    setTypography(next);
    void save({ typography: next }, "typography", () =>
      setTypography(normalizeSiteTypography(settings.typography)),
    );
  };

  const resetTypography = () => {
    const previous = typography;
    const next = normalizeSiteTypography(DEFAULT_SITE_TYPOGRAPHY);
    setTypography(next);
    void save({ typography: next }, "typography", () => setTypography(previous));
  };

  const saveHero = () => {
    const next = normalizeHeroSettings(hero);
    setHero(next);
    void save({ hero: next }, "hero", () => setHero(normalizeHeroSettings(settings.hero)));
  };

  const resetHero = () => {
    const previous = hero;
    const next = normalizeHeroSettings();
    setHero(next);
    void save({ hero: next }, "hero", () => setHero(previous));
  };

  const savePromoBar = () => {
    const next = normalizePromoBarSettings(promoBar);
    setPromoBar(next);
    void save({ promoBar: next }, "promoBar", () =>
      setPromoBar(normalizePromoBarSettings(settings.promoBar)),
    );
  };

  const resetPromoBar = () => {
    const previous = promoBar;
    const next = normalizePromoBarSettings(DEFAULT_PROMO_BAR_SETTINGS);
    setPromoBar(next);
    void save({ promoBar: next }, "promoBar", () => setPromoBar(previous));
  };

  const saveShopByIndustry = () => {
    const next = normalizeShopByIndustrySettings(shopByIndustry);
    setShopByIndustry(next);
    void save({ shopByIndustry: next }, "shopByIndustry", () =>
      setShopByIndustry(normalizeShopByIndustrySettings(settings.shopByIndustry)),
    );
  };

  const resetShopByIndustry = () => {
    const previous = shopByIndustry;
    const next = normalizeShopByIndustrySettings(DEFAULT_SHOP_BY_INDUSTRY_SETTINGS);
    setShopByIndustry(next);
    void save({ shopByIndustry: next }, "shopByIndustry", () => setShopByIndustry(previous));
  };

  const saveFeaturedCategory = () => {
    const next = normalizeFeaturedCategorySettings(featuredCategory);
    setFeaturedCategory(next);
    void save({ featuredCategory: next }, "featuredCategory", () =>
      setFeaturedCategory(normalizeFeaturedCategorySettings(settings.featuredCategory)),
    );
  };

  const resetFeaturedCategory = () => {
    const previous = featuredCategory;
    const next = normalizeFeaturedCategorySettings(DEFAULT_FEATURED_CATEGORY_SETTINGS);
    setFeaturedCategory(next);
    void save({ featuredCategory: next }, "featuredCategory", () => setFeaturedCategory(previous));
  };

  const saveTestimonials = () => {
    const next = normalizeHomeTestimonialsSettings(testimonialsRef.current);
    setTestimonials(next);
    void save({ testimonials: next }, "testimonials", () =>
      setTestimonials(normalizeHomeTestimonialsSettings(settings.testimonials)),
    );
  };

  const resetTestimonials = () => {
    const previous = testimonialsRef.current;
    const next = normalizeHomeTestimonialsSettings(DEFAULT_HOME_TESTIMONIALS_SETTINGS);
    setTestimonials(next);
    void save({ testimonials: next }, "testimonials", () => setTestimonials(previous));
  };

  const uploadTestimonialStarIcon = async (file: File) => {
    if (busy) {
      return;
    }
    setBusy("testimonials");
    try {
      const data = new FormData();
      data.set("slug", "testimonials");
      data.set("file", file);
      const response = await fetch("/admin/api/media", { method: "POST", body: data });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Upload failed.");
      }
      const next = normalizeHomeTestimonialsSettings({
        ...testimonialsRef.current,
        starIcon: payload.url,
      });
      await patchSiteSettingsAction({ testimonials: next });
      setTestimonials(next);
      testimonialsRef.current = next;
      setNotice({ id: Date.now(), text: "Star icon saved." });
    } catch (error) {
      setNotice({
        id: Date.now(),
        text: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setBusy("");
    }
  };

  const saveTrustBar = () => {
    const next = normalizeTrustBarSettings(trustBarRef.current);
    setTrustBar(next);
    void save({ trustBar: next }, "trustBar", () =>
      setTrustBar(normalizeTrustBarSettings(settings.trustBar)),
    );
  };

  const resetTrustBar = () => {
    const previous = trustBarRef.current;
    const next = normalizeTrustBarSettings(DEFAULT_TRUST_BAR_SETTINGS);
    setTrustBar(next);
    void save({ trustBar: next }, "trustBar", () => setTrustBar(previous));
  };

  const uploadTrustBarImage = async (
    file: File,
    target: { kind: "still"; index: 0 | 1 } | { kind: "slide"; index: number },
  ) => {
    if (busy) {
      return;
    }
    setBusy("trustBar");
    try {
      const data = new FormData();
      data.set("slug", "trust-bar");
      data.set("file", file);
      const response = await fetch("/admin/api/media", { method: "POST", body: data });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Upload failed.");
      }
      const url = payload.url;
      const current = trustBarRef.current;
      const withImage: TrustBarSettings =
        target.kind === "still"
          ? {
              ...current,
              stills: current.stills.map((item, index) =>
                index === target.index ? { ...item, image: url } : item,
              ) as TrustBarSettings["stills"],
            }
          : {
              ...current,
              carousel: {
                ...current.carousel,
                slides: current.carousel.slides.map((slide, slideIndex) =>
                  slideIndex === target.index ? { ...slide, image: url } : slide,
                ),
              },
            };
      const next = normalizeTrustBarSettings(withImage);
      await patchSiteSettingsAction({ trustBar: next });
      setTrustBar(next);
      trustBarRef.current = next;
      setNotice({ id: Date.now(), text: "Image saved." });
    } catch (error) {
      setNotice({
        id: Date.now(),
        text: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setBusy("");
    }
  };

  const uploadHeroImage = async (file: File, target: number | "container") => {
    if (busy) {
      return;
    }
    setBusy("hero");
    try {
      const data = new FormData();
      data.set("slug", "hero");
      data.set("file", file);
      const response = await fetch("/admin/api/media", { method: "POST", body: data });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Upload failed.");
      }
      setHero((current) =>
        target === "container"
          ? { ...current, backgroundImage: payload.url as string }
          : {
              ...current,
              slides: current.slides.map((slide, slideIndex) =>
                slideIndex === target ? { ...slide, image: payload.url as string } : slide,
              ),
            },
      );
      if (target === "container") {
        await patchSiteSettingsAction({
          hero: normalizeHeroSettings({ ...hero, backgroundImage: payload.url as string }),
        });
        setNotice({ id: Date.now(), text: "Background image saved." });
      } else {
        setNotice({ id: Date.now(), text: "Slide image uploaded. Save to apply." });
      }
    } catch (error) {
      setNotice({
        id: Date.now(),
        text: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-4">
      <AdminToast notice={notice} />

      <div className="flex flex-wrap gap-2 border-b border-navy/10 pb-3">
        {(
          [
            { id: "global", label: "Global settings" },
            { id: "home", label: "Home page settings" },
          ] as const
        ).map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-navy text-white"
                  : "bg-navy/[0.05] text-navy hover:bg-navy/10"
              }`}
              aria-pressed={active}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "global" ? (
        <div className="space-y-4">
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <div className={adminBox}>
              <h2 className={adminBoxHead}>Brand identity</h2>
              <div className="space-y-5 p-3">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-navy">Favicon</p>
                  <p className={`mt-0.5 text-xs ${adminMuted}`}>
                    Browser tabs and bookmarks. ICO, PNG, or SVG.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-navy/15 bg-navy/[0.03]">
                    {favicon ? (
                      <img src={favicon} alt="Favicon preview" className="h-7 w-7 object-contain" />
                    ) : (
                      <span className={`text-[10px] ${adminMuted}`}>None</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={adminGhost}
                      disabled={Boolean(busy)}
                      onClick={() => faviconRef.current?.click()}
                    >
                      {busy === "favicon" ? "Uploading…" : favicon ? "Replace" : "Upload"}
                    </button>
                    {favicon ? (
                      <button
                        type="button"
                        className={adminGhost}
                        disabled={Boolean(busy)}
                        onClick={() => {
                          setFavicon("");
                          void save({ favicon: "" }, "favicon", () => setFavicon(favicon));
                        }}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <input
                    ref={faviconRef}
                    type="file"
                    accept=".ico,.png,.svg,.webp,.jpg,.jpeg,image/x-icon,image/png,image/svg+xml"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) {
                        void upload(file, "favicon");
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-navy">Site logo</p>
                  <p className={`mt-0.5 text-xs ${adminMuted}`}>
                    Default logo for header (and footer unless a separate footer logo is enabled).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-12 min-w-12 max-w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-navy/15 bg-navy/[0.03] px-2">
                    {logo ? (
                      <img src={logo} alt="Site logo preview" className="max-h-9 max-w-[140px] object-contain" />
                    ) : (
                      <span className={`text-xs ${adminMuted}`}>No logo</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={adminGhost}
                      disabled={Boolean(busy)}
                      onClick={() => logoRef.current?.click()}
                    >
                      {busy === "logo" ? "Uploading…" : logo ? "Replace" : "Upload"}
                    </button>
                    {logo ? (
                      <button
                        type="button"
                        className={adminGhost}
                        disabled={Boolean(busy)}
                        onClick={() => {
                          setLogo("");
                          void save({ logo: "" }, "logo", () => setLogo(logo));
                        }}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) {
                        void upload(file, "logo");
                      }
                    }}
                  />
                </div>
                <div className="space-y-4">
                  <LogoPlacement
                    label="Header"
                    checked={logoInHeader}
                    disabled={Boolean(busy)}
                    height={logoHeaderHeight}
                    onToggle={toggleHeader}
                    onHeight={setLogoHeaderHeight}
                    onHeightCommit={(value) =>
                      commitLogoHeight("logoHeaderHeight", value, "header", setLogoHeaderHeight)
                    }
                  />
                  <LogoPlacement
                    label="Footer"
                    checked={logoInFooter}
                    disabled={Boolean(busy)}
                    height={logoFooterHeight}
                    onToggle={toggleFooter}
                    onHeight={setLogoFooterHeight}
                    onHeightCommit={(value) =>
                      commitLogoHeight("logoFooterHeight", value, "footer", setLogoFooterHeight)
                    }
                  />
                  <div className="space-y-3 rounded-lg border border-navy/10 bg-navy/[0.02] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-navy">Separate footer logo</p>
                        <p className={`mt-0.5 text-xs ${adminMuted}`}>
                          Use a different image in the footer only.
                        </p>
                      </div>
                      <Switch
                        checked={separateFooterLogo}
                        disabled={Boolean(busy) || !logoInFooter}
                        label="Use separate footer logo"
                        onToggle={toggleSeparateFooterLogo}
                      />
                    </div>
                    {separateFooterLogo && logoInFooter ? (
                      <div className="space-y-2 border-t border-navy/10 pt-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex h-12 min-w-12 max-w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-navy/15 bg-white px-2">
                            {footerLogo ? (
                              <img
                                src={footerLogo}
                                alt="Footer logo preview"
                                className="max-h-9 max-w-[140px] object-contain"
                              />
                            ) : (
                              <span className={`text-xs ${adminMuted}`}>Select logo</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className={adminGhost}
                              disabled={Boolean(busy)}
                              onClick={() => footerLogoRef.current?.click()}
                            >
                              {busy === "footerLogo"
                                ? "Uploading…"
                                : footerLogo
                                  ? "Replace"
                                  : "Upload"}
                            </button>
                            {footerLogo ? (
                              <button
                                type="button"
                                className={adminGhost}
                                disabled={Boolean(busy)}
                                onClick={() => {
                                  setFooterLogo("");
                                  void save({ footerLogo: "" }, "footerLogo", () =>
                                    setFooterLogo(footerLogo),
                                  );
                                }}
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                          <input
                            ref={footerLogoRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = "";
                              if (file) {
                                void upload(file, "footerLogo");
                              }
                            }}
                          />
                        </div>
                        {!footerLogo ? (
                          <p className={`text-xs ${adminMuted}`}>
                            Upload a footer logo, or the site name text will show until one is set.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ColorSchemeEditor
            colors={colors}
            linkTransitionMs={linkTransitionMs}
            busy={busy === "colors"}
            onChange={setColor}
            onTransitionChange={setLinkTransitionMs}
            onSave={saveColors}
            onReset={resetColors}
          />
          </div>
          <TypographyEditor
            typography={typography}
            busy={busy === "typography"}
            onChange={setTypography}
            onSave={saveTypography}
            onReset={resetTypography}
          />
          <PromoBarEditor
            promoBar={promoBar}
            busy={busy === "promoBar"}
            onChange={setPromoBar}
            onSave={savePromoBar}
            onReset={resetPromoBar}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <HeroCarouselEditor
            hero={hero}
            busy={busy === "hero"}
            onChange={setHero}
            onSave={saveHero}
            onReset={resetHero}
            onUpload={uploadHeroImage}
          />

          <TrustBarEditor
            trustBar={trustBar}
            busy={busy === "trustBar"}
            onChange={setTrustBar}
            onSave={saveTrustBar}
            onReset={resetTrustBar}
            onUploadStill={(index, file) => void uploadTrustBarImage(file, { kind: "still", index })}
            onUploadSlide={(index, file) => void uploadTrustBarImage(file, { kind: "slide", index })}
          />

          <ShopByIndustryEditor
            settings={shopByIndustry}
            categories={categories}
            busy={busy === "shopByIndustry"}
            onChange={setShopByIndustry}
            onSave={saveShopByIndustry}
            onReset={resetShopByIndustry}
          />

          <FeaturedCategoryEditor
            settings={featuredCategory}
            categories={categories}
            busy={busy === "featuredCategory"}
            onChange={setFeaturedCategory}
            onSave={saveFeaturedCategory}
            onReset={resetFeaturedCategory}
          />

          <TestimonialsEditor
            settings={testimonials}
            busy={busy === "testimonials"}
            onChange={setTestimonials}
            onSave={saveTestimonials}
            onReset={resetTestimonials}
            onUploadStarIcon={(file) => void uploadTestimonialStarIcon(file)}
          />
        </div>
      )}
    </div>
  );
}
