"use client";

import { useState } from "react";
import Link from "next/link";
import { setProductTabsOverrideAction } from "@/app/admin/actions";
import { AdminToast } from "@/components/admin/AdminNotice";
import { ProductDataTabsFields } from "@/components/admin/ProductDataTabsFields";
import type { ProductTab, TabTemplate } from "@/lib/catalog";

export function ProductTabsEditor({
  defaultTabs = [],
  defaultOverride = false,
  globalEnabled,
  mediaSlug,
  productSlug,
  templates,
}: {
  defaultTabs?: ProductTab[];
  defaultOverride?: boolean;
  globalEnabled: boolean;
  mediaSlug: string;
  productSlug?: string;
  templates: TabTemplate[];
}) {
  const [override, setOverride] = useState(defaultOverride);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);
  const locked = globalEnabled && !override;

  const toggle = async () => {
    if (busy) {
      return;
    }
    const next = !override;
    setOverride(next);
    if (!productSlug) {
      setNotice({
        id: Date.now(),
        text: next
          ? "This product will use its own data tabs."
          : "This product will use the global data tabs.",
      });
      return;
    }
    setBusy(true);
    try {
      await setProductTabsOverrideAction(productSlug, next);
      setNotice({
        id: Date.now(),
        text: next
          ? "This product now uses its own data tabs."
          : "This product now uses the global data tabs.",
      });
    } catch {
      setOverride(!next);
      setNotice({ id: Date.now(), text: "Could not save the toggle. Try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <AdminToast notice={notice} />
      <input type="hidden" name="tabsOverride" value={globalEnabled && override ? "1" : "0"} />
      {globalEnabled ? (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-navy/10 bg-navy/[0.03] px-3 py-2">
          <div>
            <p className="text-sm text-navy">Global product data tabs are applied.</p>
            <Link href="/admin/products/page-settings" className="mt-1 inline-block text-xs font-medium text-navy underline">
              Edit global tabs
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-navy">Override global tabs</p>
              <p className="text-xs text-navy/60">
                {override
                  ? "This product uses its own extra tabs"
                  : "This product uses the site-wide extra tabs"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={override}
              aria-label="Override global product data tabs"
              disabled={busy}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                override ? "bg-yellow" : "bg-navy/20"
              }`}
              onClick={() => void toggle()}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  override ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      ) : null}
      <ProductDataTabsFields
        defaultTabs={defaultTabs}
        mediaSlug={mediaSlug}
        templates={templates}
        disabled={locked}
      />
    </div>
  );
}
