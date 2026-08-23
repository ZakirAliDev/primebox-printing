"use client";

import { useEffect, useState } from "react";
import { footerBottomOffset } from "@/lib/footer-offset";

const SCROLL_THRESHOLD_PX = 320;
const COUNT_BAR_GAP_PX = 12;

function scrollTopBottomOffset() {
  let offset = footerBottomOffset();
  const countBar = document.querySelector("[data-category-product-count]");
  if (countBar) {
    offset += countBar.getBoundingClientRect().height + COUNT_BAR_GAP_PX;
  }
  return offset;
}

function ScrollToTopArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="block h-5 w-5 shrink-0"
      fill="none"
    >
      <path
        d="M12 7v9"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M8.5 10.5 12 7 15.5 10.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(20);

  useEffect(() => {
    const update = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD_PX);
      setBottomOffset(scrollTopBottomOffset());
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`scroll-to-top-button fixed right-[20px] z-50 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-navy/15 bg-surface p-0 text-navy shadow-lg hover:border-yellow hover:bg-yellow/10 hover:text-navy ${
        visible
          ? "scroll-to-top-button--visible pointer-events-auto"
          : "scroll-to-top-button--hidden pointer-events-none"
      }`}
      style={{ bottom: `${bottomOffset}px` }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ScrollToTopArrow />
    </button>
  );
}
