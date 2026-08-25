"use client";

import { useEffect, useState } from "react";
import { CategoryCard, type CategoryCardItem } from "@/components/CategoryCard";

type ShopByIndustryPayload = {
  title: string;
  subtitle: string;
  industries: CategoryCardItem[];
};

/**
 * Renders SSR cards immediately, then re-fetches from /api/shop-by-industry so a
 * poisoned Hostinger CDN HTML snapshot cannot keep showing stale names/images.
 */
export function ShopByIndustrySection({ initial }: { initial: ShopByIndustryPayload }) {
  const [data, setData] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(`/api/shop-by-industry?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const next = (await response.json()) as ShopByIndustryPayload;
        if (!cancelled && Array.isArray(next.industries)) {
          setData(next);
        }
      } catch {
        // Keep SSR data if the live fetch fails.
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (data.industries.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-3xl font-semibold">{data.title}</h2>
      {data.subtitle ? <p className="mt-2 max-w-2xl text-muted">{data.subtitle}</p> : null}
      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        {data.industries.map((industry) => (
          <li key={industry.slug}>
            <CategoryCard item={industry} />
          </li>
        ))}
      </ul>
    </section>
  );
}
