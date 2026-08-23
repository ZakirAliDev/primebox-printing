"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { RichText } from "@/components/RichText";
import {
  DEFAULT_EXTRA_CONTENT_ALIGN,
  DEFAULT_EXTRA_CONTENT_ANIMATION_MS,
  DEFAULT_EXTRA_CONTENT_COLLAPSED_HEIGHT,
  type ExtraContentAlign,
} from "@/lib/catalog";

const ALIGN_CLASS: Record<ExtraContentAlign, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export function ShowMoreContent({
  html,
  align = DEFAULT_EXTRA_CONTENT_ALIGN,
  animationMs = DEFAULT_EXTRA_CONTENT_ANIMATION_MS,
  collapsedHeight = DEFAULT_EXTRA_CONTENT_COLLAPSED_HEIGHT,
}: {
  html: string;
  align?: ExtraContentAlign;
  animationMs?: number;
  collapsedHeight?: number;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const [maxHeight, setMaxHeight] = useState(collapsedHeight);

  openRef.current = open;

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) {
      return;
    }
    const measure = () => {
      const full = inner.scrollHeight;
      setNeedsToggle(full > collapsedHeight + 8);
      if (openRef.current) {
        setMaxHeight(full);
      } else {
        setMaxHeight(collapsedHeight);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [html, collapsedHeight]);

  const toggle = () => {
    const inner = innerRef.current;
    if (!inner) {
      return;
    }
    if (open) {
      const delta = Math.max(0, inner.scrollHeight - collapsedHeight);
      const spacer = document.createElement("div");
      spacer.setAttribute("aria-hidden", "true");
      spacer.style.height = `${delta}px`;
      spacer.style.pointerEvents = "none";
      document.body.appendChild(spacer);

      const lockedScroll = window.scrollY;
      const root = document.documentElement;
      root.style.setProperty("overflow-anchor", "none");
      setMaxHeight(collapsedHeight);
      setOpen(false);

      const onScroll = () => {
        if (window.scrollY !== lockedScroll) {
          window.scrollTo(0, lockedScroll);
        }
      };
      window.addEventListener("scroll", onScroll, true);
      window.setTimeout(() => {
        window.removeEventListener("scroll", onScroll, true);
        const section = inner.closest("section");
        if (section) {
          const top = section.getBoundingClientRect().top;
          if (top < 0) {
            window.scrollTo(0, window.scrollY + top - 16);
          }
        }
        spacer.remove();
        root.style.removeProperty("overflow-anchor");
      }, animationMs + 50);
      return;
    }
    setMaxHeight(inner.scrollHeight);
    setOpen(true);
  };

  return (
    <section className="flex w-full flex-col px-4 py-5 text-muted [overflow-anchor:none]">
      <div
        className="relative w-full overflow-hidden [overflow-anchor:none]"
        style={{
          maxHeight,
          transition: `max-height ${animationMs}ms ease-in-out`,
        }}
      >
        <div ref={innerRef}>
          <RichText html={html} />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[50px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,1))] transition-opacity duration-300"
          style={{ opacity: open || !needsToggle ? 0 : 1 }}
        />
      </div>
      {needsToggle ? (
        <div className={`mt-[15px] flex w-full [overflow-anchor:none] ${ALIGN_CLASS[align]}`}>
          <button
            type="button"
            aria-expanded={open}
            className="inline-block cursor-pointer border-b border-dashed border-link text-sm font-semibold text-link transition-[color,border-color] duration-200 [overflow-anchor:none] hover:opacity-80"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.currentTarget.blur();
              toggle();
            }}
          >
            {open ? "Show less" : "Show more"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
