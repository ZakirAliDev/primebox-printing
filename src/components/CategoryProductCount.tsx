import type { ReactNode } from "react";

export function categoryProductCountLabel(visible: number, total: number) {
  const productWord = total === 1 ? "product" : "products";
  return `Showing ${visible} of ${total} ${productWord}`;
}

export function CategoryProductsSection({ children }: { children: ReactNode }) {
  return <section className="mt-10">{children}</section>;
}
