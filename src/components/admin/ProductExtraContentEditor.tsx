"use client";

import { useState } from "react";
import Link from "next/link";
import { setProductExtraContentOverrideAction } from "@/app/admin/actions";
import { AdminToast } from "@/components/admin/AdminNotice";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export function ProductExtraContentEditor({
  defaultContent = "",
  defaultOverride = false,
  globalEnabled,
  mediaSlug,
  productSlug,
}: {
  defaultContent?: string;
  defaultOverride?: boolean;
  globalEnabled: boolean;
  mediaSlug: string;
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
        text: next
          ? "This product will use its own extra content."
          : "This product will use the global extra content.",
      });
      return;
    }
    setBusy(true);
    try {
      await setProductExtraContentOverrideAction(productSlug, next);
      setNotice({
        id: Date.now(),
        text: next
          ? "This product now uses its own extra content."
          : "This product now uses the global extra content.",
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
      <input type="hidden" name="extraContentOverride" value={globalEnabled && override ? "1" : "0"} />
      {globalEnabled ? (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-navy/10 bg-navy/[0.03] px-3 py-2">
          <div>
            <p className="text-sm text-navy">Global extra content is applied.</p>
            <Link href="/admin/products/page-settings" className="mt-1 inline-block text-xs font-medium text-navy underline">
              Edit global extra content
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-navy">Override global extra content</p>
              <p className="text-xs text-navy/60">
                {override
                  ? "This product uses its own extra content"
                  : "This product uses the site-wide extra content"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={override}
              aria-label="Override global extra content"
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
      <div className={locked ? "pointer-events-none opacity-60" : undefined}>
        <RichTextEditor
          name={locked ? undefined : "extraContent"}
          defaultValue={defaultContent}
          height={280}
          mediaSlug={mediaSlug}
        />
      </div>
    </div>
  );
}
