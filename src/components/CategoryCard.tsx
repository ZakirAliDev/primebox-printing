import Link from "next/link";
import { CategoryCardMedia } from "@/components/CategoryCardMedia";
import { RichText } from "@/components/RichText";

export type CategoryCardItem = {
  slug: string;
  name: string;
  description: string;
  supportingText: string;
  image: string;
};

export function CategoryCard({
  item,
  className = "",
}: {
  item: CategoryCardItem;
  className?: string;
}) {
  return (
    <Link
      href={`/package-category/${item.slug}`}
      className={`category-card related-product-card group flex h-full flex-col overflow-hidden rounded-xl border border-border/10 bg-surface sm:flex-row ${className}`.trim()}
    >
      <CategoryCardMedia image={item.image} name={item.name} />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-4 py-3 sm:px-5 sm:py-3.5">
        <h3 className="font-semibold leading-snug text-navy">{item.name}</h3>
        {item.description ? (
          <p className="mb-3 line-clamp-2 leading-snug text-navy/70">{item.description}</p>
        ) : null}
        <RichText
          html={item.supportingText}
          className="category-card__supporting leading-snug text-navy/65"
        />
      </div>
    </Link>
  );
}
