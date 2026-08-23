"use client";

import { useState } from "react";
import { Accordion } from "@/components/Accordion";
import { RichText } from "@/components/RichText";
import { TemplateLayoutView } from "@/components/TemplateLayoutView";
import type { ProductTab, TabTemplate } from "@/lib/catalog";

export function ProductDataTabs({
  description,
  tabs,
  templates,
}: {
  description: string;
  tabs: ProductTab[];
  templates: TabTemplate[];
}) {
  const items = [{ title: "Description" }, ...tabs.map((tab) => ({ title: tab.title }))];
  const [active, setActive] = useState(0);

  if (tabs.length === 0) {
    return (
      <Accordion
        defaultOpen
        title="Description"
        className="rounded-lg border border-border/10"
        titleClassName="bg-button px-4 py-3 font-semibold text-button-text"
      >
        <div className="px-4 py-5 text-muted">
          <RichText html={description} />
        </div>
      </Accordion>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/10 bg-surface">
      <div className="flex flex-wrap border-b border-border/10 bg-navy/[0.03]" role="tablist">
        {items.map((item, index) => {
          const selected = active === index;
          return (
            <button
              key={`${item.title}-${index}`}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`relative px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
                selected ? "bg-button text-button-text" : "text-muted hover:bg-navy/[0.04] hover:text-foreground"
              }`}
              onClick={() => setActive(index)}
            >
              {item.title}
            </button>
          );
        })}
      </div>
      <div key={active} className="product-tab-panel px-5 py-6 text-muted" role="tabpanel">
        {active === 0 ? (
          <RichText html={description} />
        ) : (
          <TabPanel tab={tabs[active - 1]} templates={templates} />
        )}
      </div>
    </div>
  );
}

function TabPanel({ tab, templates }: { tab?: ProductTab; templates: TabTemplate[] }) {
  if (!tab) {
    return null;
  }
  if (tab.source === "template" && tab.template) {
    const template = templates.find((item) => item.slug === tab.template);
    if (template) {
      return <TemplateLayoutView layout={template.layout} />;
    }
  }
  return <RichText html={tab.content} />;
}
