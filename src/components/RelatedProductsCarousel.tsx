"use client";

import { ProductCard } from "@/components/ProductCard";
import {
  relatedLoopBounds,
  relatedLoopItems,
  relatedSnapLoopIndex,
  uniqueRelatedItems,
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
  label = "Related packages",
}: {
  items: RelatedItem[];
  slides: RelatedCarouselSlides;
  autoplay?: boolean;
  autoplayMs?: number;
  label?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef({ x: 0, y: 0, swiped: false });
  const [visible, setVisible] = useState(slides.base);
  const [slideWidth, setSlideWidth] = useState(0);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const uniqueItems = useMemo(() => uniqueRelatedItems(items), [items]);
  const bounds = useMemo(() => relatedLoopBounds(uniqueItems, visible), [uniqueItems, visible]);
  const loopItems = useMemo(() => relatedLoopItems(uniqueItems, visible), [uniqueItems, visible]);
  const canLoop = uniqueItems.length > visible;

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const nextVisible = slidesForWidth(window.innerWidth, slides);
    const width = viewport.clientWidth;
    const nextLayoutCount = Math.max(Math.min(nextVisible, uniqueItems.length || 1), 1);
    const nextSlideWidth =
      nextLayoutCount > 0
        ? (width - GAP_PX * Math.max(nextLayoutCount - 1, 0)) / nextLayoutCount
        : width;

    setVisible(nextVisible);
    setSlideWidth(nextSlideWidth);
  }, [slides, uniqueItems.length]);

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
  }, [bounds.start, uniqueItems, visible]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const snapped = relatedSnapLoopIndex(scrollIndex, uniqueItems, visible);
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
  }, [uniqueItems, reducedMotion, scrollIndex, visible]);

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
  const offsetPx = canLoop ? scrollIndex * stepPx : 0;
  const canTransition = animate && !reducedMotion && canLoop;

  const step = useCallback(
    (delta: number) => {
      if (!canLoop) {
        return;
      }
      setAnimate(true);
      setScrollIndex((current) => current + delta);
    },
    [canLoop],
  );

  useEffect(() => {
    if (paused || !autoplay || reducedMotion || !canLoop || uniqueItems.length === 0) {
      return;
    }
    const timer = window.setInterval(() => step(1), autoplayMs);
    return () => window.clearInterval(timer);
  }, [autoplay, autoplayMs, canLoop, uniqueItems.length, paused, reducedMotion, step]);

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

  if (uniqueItems.length === 0) {
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
      {canLoop ? (
        <button
          type="button"
          className={`${arrowClassName} left-0 -translate-x-[calc(100%+0.75rem)] max-md:left-1 max-md:translate-x-0`}
          aria-label={`Show previous ${label}`}
          onClick={() => step(-1)}
        >
          <CarouselArrow dir="prev" />
        </button>
      ) : null}

      <div
        ref={viewportRef}
        className="w-full touch-pan-y select-none"
        aria-roledescription="carousel"
        aria-label={label}
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
                key={canLoop ? `${item.slug}-${index}` : item.slug}
                className="shrink-0"
                style={{ width: slideWidth > 0 ? slideWidth : "100%" }}
              >
                <ProductCard item={item} onClick={onLinkClick} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {canLoop ? (
        <button
          type="button"
          className={`${arrowClassName} right-0 translate-x-[calc(100%+0.75rem)] max-md:right-1 max-md:translate-x-0`}
          aria-label={`Show next ${label}`}
          onClick={() => step(1)}
        >
          <CarouselArrow dir="next" />
        </button>
      ) : null}
    </div>
  );
}
