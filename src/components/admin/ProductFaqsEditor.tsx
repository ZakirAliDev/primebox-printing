"use client";

import { useState } from "react";
import Link from "next/link";
import { setProductFaqsOverrideAction } from "@/app/admin/actions";
import { AdminToast } from "@/components/admin/AdminNotice";
import { ProductFaqFields } from "@/components/admin/ProductFaqFields";
import type { ProductFaq } from "@/lib/catalog";

export function ProductFaqsEditor({
  defaultFaqs = [],
  defaultEnabled = true,
  defaultOverride = false,
  globalEnabled,
  productSlug,
}: {
  defaultFaqs?: ProductFaq[];
  defaultEnabled?: boolean;
  defaultOverride?: boolean;
  globalEnabled: boolean;
  productSlug?: string;
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
        text: next ? "This product will use its own FAQs." : "This product will use the global FAQs.",
      });
      return;
    }
    setBusy(true);
    try {
      await setProductFaqsOverrideAction(productSlug, next);
      setNotice({
        id: Date.now(),
        text: next ? "This product now uses its own FAQs." : "This product now uses the global FAQs.",
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
      <input type="hidden" name="faqsOverride" value={globalEnabled && override ? "1" : "0"} />
      {globalEnabled ? (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-navy/10 bg-navy/[0.03] px-3 py-2">
          <div>
            <p className="text-sm text-navy">Global FAQs are applied.</p>
            <Link href="/admin/products/page-settings" className="mt-1 inline-block text-xs font-medium text-navy underline">
              Edit global FAQs
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-navy">Override global FAQs</p>
              <p className="text-xs text-navy/60">
                {override ? "This product uses its own FAQs" : "This product uses the site-wide FAQs"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={override}
              aria-label="Override global FAQs"
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
      <ProductFaqFields
        defaultFaqs={defaultFaqs}
        defaultEnabled={defaultEnabled}
        productSlug={productSlug}
        showDisplayToggle={!locked}
        disabled={locked}
      />
    </div>
  );
}
