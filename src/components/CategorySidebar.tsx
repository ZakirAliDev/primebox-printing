import Link from "next/link";
import { categoryDepth, orderedCategories, type Category } from "@/lib/catalog";

export function CategorySidebar({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug: string;
}) {
  const items = orderedCategories(categories);

  return (
    <nav aria-label="Browse categories" className="rounded-lg border border-border/10 bg-surface">
      <h4 className="border-b border-border/10 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-navy">
        Categories
      </h4>
      <ul className="max-h-[min(70vh,640px)] overflow-y-auto py-2">
        {items.map((category) => {
          const active = category.slug === activeSlug;
          const depth = categoryDepth(categories, category.slug);

          return (
            <li key={category.slug}>
              <Link
                href={`/package-category/${category.slug}`}
                aria-current={active ? "page" : undefined}
                className={[
                  "block border-l-4 py-2 pr-4 text-sm leading-snug transition-colors",
                  active
                    ? "border-yellow bg-yellow/15 font-semibold text-navy"
                    : "border-transparent text-navy/75 hover:border-navy/15 hover:bg-navy/[0.03] hover:text-navy",
                ].join(" ")}
                style={{ paddingLeft: `${12 + depth * 14}px` }}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
