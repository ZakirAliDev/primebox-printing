"use client";

import { ProductCard } from "@/components/ProductCard";
import {
  relatedLoopBounds,
  relatedLoopItems,
  relatedSnapLoopIndex,
} from "@/lib/related-carousel";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { RelatedCarouselSlides } from "@/lib/catalog";

const GAP_PX = 24;
const TRANSITION_MS = 300;
const SWIPE_PX = 48;

type RelatedItem = {
  slug: string;
  name: string;
  summary: string;
  image: string;
};

function slidesForWidth(width: number, slides: RelatedCarouselSlides) {
  if (width >= 1280) {
    return slides.xl;
  }
  if (width >= 1024) {
    return slides.lg;
  }
  if (width >= 768) {
    return slides.md;
  }
  if (width >= 640) {
    return slides.sm;
  }
  return slides.base;
}

function CarouselArrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RelatedProductsCarousel({
  items,
  slides,
  autoplay = true,
  autoplayMs = 5000,
}: {
  items: RelatedItem[];
  slides: RelatedCarouselSlides;
  autoplay?: boolean;
  autoplayMs?: number;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef({ x: 0, y: 0, swiped: false });
  const [visible, setVisible] = useState(slides.base);
  const [slideWidth, setSlideWidth] = useState(0);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const bounds = useMemo(() => relatedLoopBounds(items, visible), [items, visible]);
  const loopItems = useMemo(() => relatedLoopItems(items, visible), [items, visible]);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const nextVisible = slidesForWidth(window.innerWidth, slides);
    const width = viewport.clientWidth;
    const nextSlideWidth =
      nextVisible > 0 ? (width - GAP_PX * Math.max(nextVisible - 1, 0)) / nextVisible : width;

    setVisible(nextVisible);
    setSlideWidth(nextSlideWidth);
  }, [slides]);

  useLayoutEffect(() => {
    measure();
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useLayoutEffect(() => {
    setAnimate(false);
    setScrollIndex(bounds.start);
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAnimate(true));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [bounds.start, items, visible]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const snapped = relatedSnapLoopIndex(scrollIndex, items, visible);
    if (snapped === scrollIndex) {
      return;
    }
    if (reducedMotion) {
      setAnimate(false);
      setScrollIndex(snapped);
      return;
    }
    const timer = window.setTimeout(() => {
      setAnimate(false);
      setScrollIndex(snapped);
    }, TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [items, reducedMotion, scrollIndex, visible]);

  useEffect(() => {
    if (animate) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAnimate(true));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [animate]);

  const stepPx = slideWidth + GAP_PX;
  const offsetPx = scrollIndex * stepPx;
  const canTransition = animate && !reducedMotion;

  const step = useCallback((delta: number) => {
    setAnimate(true);
    setScrollIndex((current) => current + delta);
  }, []);

  useEffect(() => {
    if (paused || !autoplay || reducedMotion || items.length === 0) {
      return;
    }
    const timer = window.setInterval(() => step(1), autoplayMs);
    return () => window.clearInterval(timer);
  }, [autoplay, autoplayMs, items.length, paused, reducedMotion, step]);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY, swiped: false };
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const dx = event.clientX - pointerStart.current.x;
    const dy = event.clientY - pointerStart.current.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      pointerStart.current.swiped = true;
    }
  }, []);

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const dx = event.clientX - pointerStart.current.x;
      const dy = event.clientY - pointerStart.current.y;
      if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) {
        return;
      }
      pointerStart.current.swiped = true;
      step(dx < 0 ? 1 : -1);
    },
    [step],
  );

  const onLinkClick = useCallback((event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (pointerStart.current.swiped) {
      event.preventDefault();
      pointerStart.current.swiped = false;
    }
  }, []);

  if (items.length === 0) {
    return null;
  }

  const arrowClassName =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-navy/15 bg-surface text-navy/70 shadow-sm hover:border-navy/30 hover:text-navy";

  return (
    <div
      className="related-products-carousel relative mt-6 w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <button
        type="button"
        className={`${arrowClassName} left-0 -translate-x-[calc(100%+0.75rem)] max-md:left-1 max-md:translate-x-0`}
        aria-label="Show previous related products"
        onClick={() => step(-1)}
      >
        <CarouselArrow dir="prev" />
      </button>

      <div
        ref={viewportRef}
        className="w-full touch-pan-y select-none"
        aria-roledescription="carousel"
        aria-label="Related packages"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="overflow-hidden">
          <ul
            className="related-products-track flex"
            style={{
              gap: GAP_PX,
              transform: `translate3d(-${offsetPx}px, 0, 0)`,
              transition: canTransition ? `transform ${TRANSITION_MS}ms ease-in-out` : "none",
            }}
          >
            {loopItems.map((item, index) => (
              <li
                key={`${item.slug}-${index}`}
                className="shrink-0"
                style={{ width: slideWidth > 0 ? slideWidth : "100%" }}
              >
                <ProductCard item={item} onClick={onLinkClick} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        className={`${arrowClassName} right-0 translate-x-[calc(100%+0.75rem)] max-md:right-1 max-md:translate-x-0`}
        aria-label="Show next related products"
        onClick={() => step(1)}
      >
        <CarouselArrow dir="next" />
      </button>
    </div>
  );
}
