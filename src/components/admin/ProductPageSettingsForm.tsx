"use client";

import { useState } from "react";
import {
  saveProductPageSettingsAction,
  setGlobalExtraContentEnabledAction,
  setGlobalFaqsEnabledAction,
  setGlobalTabsEnabledAction,
} from "@/app/admin/actions";
import { AdminPageActions } from "@/components/admin/AdminPageBar";
import { AdminToast } from "@/components/admin/AdminNotice";
import { ProductDataTabsFields } from "@/components/admin/ProductDataTabsFields";
import { ProductFaqFields } from "@/components/admin/ProductFaqFields";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { adminBox, adminBoxHead, adminField, adminMuted, adminPrimary } from "@/components/admin/ui";
import type { ExtraContentAlign, ProductPageSettings, TabTemplate } from "@/lib/catalog";
import {
  RELATED_CAROUSEL_AUTOPLAY_MAX,
  RELATED_CAROUSEL_AUTOPLAY_MIN,
  RELATED_CAROUSEL_SLIDES_MAX,
  RELATED_CAROUSEL_SLIDES_MIN,
} from "@/lib/catalog";

const ALIGN_OPTIONS: { value: ExtraContentAlign; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export function ProductPageSettingsForm({
  settings,
  templates,
}: {
  settings: ProductPageSettings;
  templates: TabTemplate[];
}) {
  const [tabsEnabled, setTabsEnabled] = useState(settings.globalTabsEnabled);
  const [faqsEnabled, setFaqsEnabled] = useState(settings.globalFaqsEnabled);
  const [extraEnabled, setExtraEnabled] = useState(settings.globalExtraContentEnabled);
  const [align, setAlign] = useState<ExtraContentAlign>(settings.extraContentAlign);
  const [busy, setBusy] = useState<"tabs" | "faqs" | "extra" | "">("");
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);

  const toggleTabs = async () => {
    if (busy) {
      return;
    }
    const next = !tabsEnabled;
    setTabsEnabled(next);
    setBusy("tabs");
    try {
      await setGlobalTabsEnabledAction(next);
      setNotice({
        id: Date.now(),
        text: next
          ? "Global product data tabs are now applied to all products."
          : "Global product data tabs are off. Each product uses its own tabs.",
      });
    } catch {
      setTabsEnabled(!next);
      setNotice({ id: Date.now(), text: "Could not save the toggle. Try again." });
    } finally {
      setBusy("");
    }
  };

  const toggleFaqs = async () => {
    if (busy) {
      return;
    }
    const next = !faqsEnabled;
    setFaqsEnabled(next);
    setBusy("faqs");
    try {
      await setGlobalFaqsEnabledAction(next);
      setNotice({
        id: Date.now(),
        text: next
          ? "Global FAQs are now applied to all products."
          : "Global FAQs are off. Each product uses its own FAQs.",
      });
    } catch {
      setFaqsEnabled(!next);
      setNotice({ id: Date.now(), text: "Could not save the toggle. Try again." });
    } finally {
      setBusy("");
    }
  };

  const toggleExtra = async () => {
    if (busy) {
      return;
    }
    const next = !extraEnabled;
    setExtraEnabled(next);
    setBusy("extra");
    try {
      await setGlobalExtraContentEnabledAction(next);
      setNotice({
        id: Date.now(),
        text: next
          ? "Global extra content is now applied to all products."
          : "Global extra content is off. Each product uses its own extra content.",
      });
    } catch {
      setExtraEnabled(!next);
      setNotice({ id: Date.now(), text: "Could not save the toggle. Try again." });
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="flex items-start gap-5">
      <AdminPageActions>
        <button form="page-settings-save" type="submit" className={adminPrimary}>
          Save settings
        </button>
      </AdminPageActions>
      <AdminToast notice={notice} />
      <form id="page-settings-save" action={saveProductPageSettingsAction} className="min-w-0 flex-1 space-y-4">
        <div className={`${adminBox} !overflow-visible`}>
          <h2 className={adminBoxHead}>Product data tabs</h2>
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-navy/10 bg-navy/[0.03] px-3 py-2">
              <div>
                <p className="text-sm font-medium text-navy">Apply these tabs to all products</p>
                <p className={`text-xs ${adminMuted}`}>
                  {tabsEnabled
                    ? "Every product page uses these extra tabs after its own Description"
                    : "Each product uses the extra tabs set on its add/edit page"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={tabsEnabled}
                aria-label="Apply these tabs to all products"
                disabled={Boolean(busy)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                  tabsEnabled ? "bg-yellow" : "bg-navy/20"
                }`}
                onClick={() => void toggleTabs()}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    tabsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className={`text-sm ${adminMuted}`}>
              These extra tabs apply site-wide when the toggle is on. Description is never set here — each product keeps
              its own Description tab. On a product’s add/edit page you can override these tabs for that product only.
            </p>
            <ProductDataTabsFields
              defaultTabs={settings.globalTabs}
              mediaSlug="product-page"
              templates={templates}
              showDescriptionTab={false}
            />
          </div>
        </div>
        <div className={`${adminBox} !overflow-visible`}>
          <h2 className={adminBoxHead}>Extra content</h2>
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-navy/10 bg-navy/[0.03] px-3 py-2">
              <div>
                <p className="text-sm font-medium text-navy">Apply this extra content to all products</p>
                <p className={`text-xs ${adminMuted}`}>
                  {extraEnabled
                    ? "Every product page shows this content under Description"
                    : "Each product uses the extra content set on its add/edit page"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={extraEnabled}
                aria-label="Apply this extra content to all products"
                disabled={Boolean(busy)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                  extraEnabled ? "bg-yellow" : "bg-navy/20"
                }`}
                onClick={() => void toggleExtra()}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    extraEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className={`text-sm ${adminMuted}`}>
              This content appears under the Description on every product page when the toggle is on. On a product’s
              add/edit page you can override it for that product only.
            </p>
            <RichTextEditor name="extraContent" defaultValue={settings.globalExtraContent} height={280} mediaSlug="product-page" />
          </div>
        </div>
        <div className={adminBox}>
          <h2 className={adminBoxHead}>FAQs</h2>
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-navy/10 bg-navy/[0.03] px-3 py-2">
              <div>
                <p className="text-sm font-medium text-navy">Apply these FAQs to all products</p>
                <p className={`text-xs ${adminMuted}`}>
                  {faqsEnabled
                    ? "Every product page uses these FAQs"
                    : "Each product uses the FAQs set on its add/edit page"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={faqsEnabled}
                aria-label="Apply these FAQs to all products"
                disabled={Boolean(busy)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                  faqsEnabled ? "bg-yellow" : "bg-navy/20"
                }`}
                onClick={() => void toggleFaqs()}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    faqsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className={`text-sm ${adminMuted}`}>
              These FAQs apply site-wide when the toggle is on. On a product’s add/edit page you can override them for
              that product only.
            </p>
            <ProductFaqFields defaultFaqs={settings.globalFaqs} showDisplayToggle={false} />
          </div>
        </div>
      </form>

      <aside className="sticky top-6 z-10 w-[280px] shrink-0 space-y-4 self-start">
        <div className={adminBox}>
          <h2 className={adminBoxHead}>Related products carousel</h2>
          <div className="space-y-4 p-3">
            <p className={`text-sm ${adminMuted}`}>
              Number of related product cards visible at once on each screen size.
            </p>
            <label className="block">
              <span className="text-sm font-medium text-navy">Mobile</span>
              <span className={`mt-0.5 block text-xs ${adminMuted}`}>Below 640px</span>
              <input
                form="page-settings-save"
                type="number"
                name="relatedCarouselSlidesBase"
                min={RELATED_CAROUSEL_SLIDES_MIN}
                max={RELATED_CAROUSEL_SLIDES_MAX}
                step={1}
                defaultValue={settings.relatedCarouselSlides.base}
                className={`${adminField} mt-1`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-navy">Small</span>
              <span className={`mt-0.5 block text-xs ${adminMuted}`}>640px and up</span>
              <input
                form="page-settings-save"
                type="number"
                name="relatedCarouselSlidesSm"
                min={RELATED_CAROUSEL_SLIDES_MIN}
                max={RELATED_CAROUSEL_SLIDES_MAX}
                step={1}
                defaultValue={settings.relatedCarouselSlides.sm}
                className={`${adminField} mt-1`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-navy">Medium</span>
              <span className={`mt-0.5 block text-xs ${adminMuted}`}>768px and up</span>
              <input
                form="page-settings-save"
                type="number"
                name="relatedCarouselSlidesMd"
                min={RELATED_CAROUSEL_SLIDES_MIN}
                max={RELATED_CAROUSEL_SLIDES_MAX}
                step={1}
                defaultValue={settings.relatedCarouselSlides.md}
                className={`${adminField} mt-1`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-navy">Large</span>
              <span className={`mt-0.5 block text-xs ${adminMuted}`}>1024px and up</span>
              <input
                form="page-settings-save"
                type="number"
                name="relatedCarouselSlidesLg"
                min={RELATED_CAROUSEL_SLIDES_MIN}
                max={RELATED_CAROUSEL_SLIDES_MAX}
                step={1}
                defaultValue={settings.relatedCarouselSlides.lg}
                className={`${adminField} mt-1`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-navy">Extra large</span>
              <span className={`mt-0.5 block text-xs ${adminMuted}`}>1280px and up</span>
              <input
                form="page-settings-save"
                type="number"
                name="relatedCarouselSlidesXl"
                min={RELATED_CAROUSEL_SLIDES_MIN}
                max={RELATED_CAROUSEL_SLIDES_MAX}
                step={1}
                defaultValue={settings.relatedCarouselSlides.xl}
                className={`${adminField} mt-1`}
              />
            </label>
            <label className="flex items-center gap-2 pt-1">
              <input
                form="page-settings-save"
                type="checkbox"
                name="relatedCarouselAutoplay"
                defaultChecked={settings.relatedCarouselAutoplay}
                className="h-4 w-4 rounded border-navy/20"
              />
              <span className="text-sm font-medium text-navy">Auto-advance carousel</span>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-navy">Autoplay interval</span>
              <span className={`mt-0.5 block text-xs ${adminMuted}`}>Milliseconds between slides.</span>
              <input
                form="page-settings-save"
                type="number"
                name="relatedCarouselAutoplayMs"
                min={RELATED_CAROUSEL_AUTOPLAY_MIN}
                max={RELATED_CAROUSEL_AUTOPLAY_MAX}
                step={500}
                defaultValue={settings.relatedCarouselAutoplayMs}
                className={`${adminField} mt-1`}
              />
            </label>
          </div>
        </div>
        <div className={adminBox}>
          <h2 className={adminBoxHead}>Extra content</h2>
          <div className="space-y-4 p-3">
            <fieldset>
              <legend className="text-sm font-medium text-navy">Show more button</legend>
              <div className="mt-2 grid grid-cols-3 overflow-hidden rounded border border-navy/20">
                {ALIGN_OPTIONS.map((option) => {
                  const selected = align === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`cursor-pointer px-2 py-1.5 text-center text-xs font-semibold ${
                        selected ? "bg-yellow text-navy" : "bg-white text-navy/70 hover:bg-navy/[0.04]"
                      }`}
                    >
                      <input
                        form="page-settings-save"
                        type="radio"
                        name="extraContentAlign"
                        value={option.value}
                        checked={selected}
                        className="sr-only"
                        onChange={() => setAlign(option.value)}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <label className="block">
              <span className="text-sm font-medium text-navy">Animation speed</span>
              <span className={`mt-0.5 block text-xs ${adminMuted}`}>Milliseconds. Higher is slower.</span>
              <input
                form="page-settings-save"
                type="number"
                name="extraContentAnimationMs"
                min={200}
                max={5000}
                step={100}
                defaultValue={settings.extraContentAnimationMs}
                className={`${adminField} mt-1`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-navy">Collapsed height</span>
              <span className={`mt-0.5 block text-xs ${adminMuted}`}>Pixels shown before Show more.</span>
              <input
                form="page-settings-save"
                type="number"
                name="extraContentCollapsedHeight"
                min={80}
                max={1200}
                step={10}
                defaultValue={settings.extraContentCollapsedHeight}
                className={`${adminField} mt-1`}
              />
            </label>
          </div>
        </div>
      </aside>
    </div>
  );
}
