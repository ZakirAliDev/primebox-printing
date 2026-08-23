import Link from "next/link";
import type { MouseEvent as ReactMouseEvent } from "react";

export type ProductCardItem = {
  slug: string;
  name: string;
  summary: string;
  image: string;
};

export function ProductCard({
  item,
  className = "",
  onClick,
}: {
  item: ProductCardItem;
  className?: string;
  onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={`/packages/${item.slug}`}
      className={`related-product-card group flex h-full flex-col overflow-hidden rounded-lg border border-border/10 bg-surface ${className}`.trim()}
      onClick={onClick}
    >
      <div className="related-product-card__media relative aspect-square w-full shrink-0 overflow-hidden bg-navy/5">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-navy/50">
            {item.name}
          </div>
        )}
        <span
          className="related-product-card__overlay pointer-events-none absolute inset-0 bg-navy/50"
          aria-hidden="true"
        />
        <span className="related-product-card__cta pointer-events-none absolute inset-0 flex items-center justify-center px-4">
          <span className="rounded bg-button px-5 py-2.5 text-sm font-semibold text-button-text shadow-md">
            Customize
          </span>
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug">{item.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-navy/70">{item.summary}</p>
      </div>
    </Link>
  );
}
