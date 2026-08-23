"use client";

import { useState } from "react";
import { setProductFaqsEnabledAction } from "@/app/admin/actions";
import { AdminToast } from "@/components/admin/AdminNotice";
import { adminField, adminGhost, adminMuted, adminTrash } from "@/components/admin/ui";
import type { ProductFaq } from "@/lib/catalog";

type FaqRow = ProductFaq & { id: string };

function emptyFaq(): FaqRow {
  return { id: crypto.randomUUID(), question: "", answer: "" };
}

export function ProductFaqFields({
  defaultFaqs = [],
  defaultEnabled = true,
  productSlug,
  showDisplayToggle = true,
  disabled = false,
}: {
  defaultFaqs?: ProductFaq[];
  defaultEnabled?: boolean;
  productSlug?: string;
  showDisplayToggle?: boolean;
  disabled?: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);
  const [rows, setRows] = useState<FaqRow[]>(
    defaultFaqs.length > 0
      ? defaultFaqs.map((faq) => ({ ...faq, id: crypto.randomUUID() }))
      : [emptyFaq()],
  );
  const [openId, setOpenId] = useState(rows[0]?.id ?? "");

  const updateRow = (id: string, field: "question" | "answer", value: string) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    const next = emptyFaq();
    setRows((current) => [...current, next]);
    setOpenId(next.id);
  };

  const removeRow = (id: string) => {
    setRows((current) => {
      const next = current.filter((row) => row.id !== id);
      if (openId === id) {
        setOpenId(next[0]?.id ?? "");
      }
      return next;
    });
  };

  const toggle = async () => {
    if (busy) {
      return;
    }
    const next = !enabled;
    setEnabled(next);
    if (!productSlug) {
      setNotice({
        id: Date.now(),
        text: next ? "FAQs will be visible on the product page." : "FAQs will be hidden on the product page.",
      });
      return;
    }
    setBusy(true);
    try {
      await setProductFaqsEnabledAction(productSlug, next);
      setNotice({
        id: Date.now(),
        text: next ? "FAQs are now visible on the product page." : "FAQs are now hidden on the product page.",
      });
    } catch {
      setEnabled(!next);
      setNotice({ id: Date.now(), text: "Could not save the toggle. Try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`space-y-3 ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      <AdminToast notice={notice} />
      <input type="hidden" name="faqsEnabled" value={enabled ? "1" : "0"} />
      {showDisplayToggle ? (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-navy/10 bg-navy/[0.03] px-3 py-2">
        <div>
          <p className="text-sm font-medium text-navy">Show FAQs on product page</p>
          <p className={`text-xs ${adminMuted}`}>{enabled ? "Visible on the front end" : "Hidden on the front end"}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Show FAQs on product page"
          disabled={busy}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
            enabled ? "bg-yellow" : "bg-navy/20"
          }`}
          onClick={() => void toggle()}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      ) : null}
      <ul className={`divide-y divide-navy/10 overflow-hidden rounded-lg border border-navy/10 ${enabled || !showDisplayToggle ? "" : "opacity-60"}`}>
        {rows.map((row, index) => {
          const open = openId === row.id;
          return (
            <li key={row.id} className={`transition-colors duration-300 ${open ? "bg-navy/[0.03]" : "bg-white"}`}>
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? "" : row.id)}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-navy text-[11px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className={`min-w-0 flex-1 truncate text-sm ${row.question ? "font-medium text-navy" : adminMuted}`}>
                    {row.question.trim() || "Untitled FAQ"}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 text-navy/40 transition-transform duration-300 ease-out ${
                      open ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {rows.length > 1 ? (
                  <button type="button" className={`${adminTrash} shrink-0 text-xs`} onClick={() => removeRow(row.id)}>
                    Remove
                  </button>
                ) : null}
              </div>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={`space-y-3 border-t border-navy/10 px-3 py-3 transition-opacity duration-300 ${
                      open ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <label className="block">
                      <span className={`mb-1 block text-xs ${adminMuted}`}>Question</span>
                      <input
                        name="faqQuestion"
                        value={row.question}
                        placeholder="What is the minimum order quantity?"
                        className={adminField}
                        onChange={(event) => updateRow(row.id, "question", event.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className={`mb-1 block text-xs ${adminMuted}`}>Answer</span>
                      <textarea
                        name="faqAnswer"
                        value={row.answer}
                        rows={3}
                        placeholder="Write the answer"
                        className={`${adminField} resize-y`}
                        onChange={(event) => updateRow(row.id, "answer", event.target.value)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {disabled ? null : (
        <button type="button" className={adminGhost} onClick={addRow}>
          + Add FAQ
        </button>
      )}
    </div>
  );
}
