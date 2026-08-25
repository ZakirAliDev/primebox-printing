import Link from "next/link";
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
      <div className="related-product-card__media relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-navy/5 sm:aspect-auto sm:w-[42%] sm:self-stretch">
        {item.image ? (
          <img src={item.image} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full min-h-[140px] items-center justify-center px-4 text-center text-xs text-navy/45 sm:min-h-full">
            {item.name}
          </div>
        )}
        <span
          className="related-product-card__overlay pointer-events-none absolute inset-0 bg-navy/50"
          aria-hidden="true"
        />
        <span className="related-product-card__cta pointer-events-none absolute inset-0 flex items-center justify-center px-4">
          <span className="rounded bg-button px-5 py-2.5 text-sm font-semibold text-button-text shadow-md">
            Explore
          </span>
        </span>
      </div>
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
