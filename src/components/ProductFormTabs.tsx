"use client";

import { useState, type ReactNode } from "react";

const TABS = [
  { id: "quote", label: "Get quote" },
  { id: "contact", label: "Contact us" },
] as const;

export function ProductFormTabs({
  quote,
  contact,
}: {
  quote: ReactNode;
  contact: ReactNode;
}) {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("quote");
  const panels = { quote, contact };

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border/10 bg-surface">
      <div className="flex flex-wrap border-b border-border/10 bg-navy/[0.03]" role="tablist" aria-label="Product inquiry">
        {TABS.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`product-form-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`product-form-panel-${tab.id}`}
              className={`relative px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
                selected ? "bg-button text-button-text" : "text-muted hover:bg-navy/[0.04] hover:text-foreground"
              }`}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {TABS.map((tab) => (
        <div
          key={tab.id}
          id={`product-form-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`product-form-tab-${tab.id}`}
          hidden={active !== tab.id}
          className="p-5 sm:p-6"
        >
          {panels[tab.id]}
        </div>
      ))}
    </div>
  );
}
