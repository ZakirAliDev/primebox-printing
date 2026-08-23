"use client";

import { useEffect, useState } from "react";
import { categoryProductCountLabel } from "@/components/CategoryProductCount";
import { footerBottomOffset, VIEWPORT_INSET_PX } from "@/lib/footer-offset";

export function CategoryProductCountBar({
  visible,
  total,
}: {
  visible: number;
  total: number;
}) {
  const [bottomOffset, setBottomOffset] = useState(VIEWPORT_INSET_PX);

  useEffect(() => {
    const update = () => setBottomOffset(footerBottomOffset());
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (total === 0) {
    return null;
  }

  return (
    <div
      data-category-product-count
      className="fixed z-40 left-1/2 w-max max-w-[calc(100vw-40px)] -translate-x-1/2 md:left-auto md:right-[20px] md:translate-x-0"
      style={{ bottom: `${bottomOffset}px` }}
      aria-live="polite"
    >
      <div className="rounded-lg border border-navy/10 bg-surface px-4 py-2.5 text-sm text-navy shadow-lg">
        {categoryProductCountLabel(visible, total)}
      </div>
    </div>
  );
}
