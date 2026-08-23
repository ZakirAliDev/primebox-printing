"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  PROMO_BAR_TRANSITION_MS,
  promoBarLoopSlides,
  promoBarSnapIndex,
  type PromoBarSettings,
} from "@/lib/promo-bar";

const SWIPE_PX = 40;

function ArrowIcon({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
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

export function PromoBarCarousel({ settings }: { settings: PromoBarSettings }) {
  const source = settings.slides;
  const length = source.length;
  const canLoop = length >= 1;
  const slides = useMemo(() => promoBarLoopSlides(source), [source]);
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const drag = useRef<{ pointer: number; startX: number } | null>(null);
  const slidePct = slides.length ? 100 / slides.length : 0;

  const step = useCallback(
    (delta: number) => {
      if (!canLoop) {
        return;
      }
      setAnimate(true);
      setIndex((current) => current + delta);
    },
    [canLoop],
  );

  useEffect(() => {
    setIndex(1);
    setAnimate(false);
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAnimate(true));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [length]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!canLoop) {
      return;
    }
    const snapped = promoBarSnapIndex(index, length);
    if (snapped === index) {
      return;
    }
    if (reducedMotion) {
      setAnimate(false);
      setIndex(snapped);
      return;
    }
    const timer = window.setTimeout(() => {
      setAnimate(false);
      setIndex(snapped);
    }, PROMO_BAR_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [canLoop, index, length, reducedMotion]);

  useEffect(() => {
    if (animate) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAnimate(true));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [animate]);

  useEffect(() => {
    if (!canLoop || paused || !settings.autoplay || reducedMotion) {
      return;
    }
    const timer = window.setInterval(() => step(1), settings.autoplayMs);
    return () => window.clearInterval(timer);
  }, [canLoop, paused, reducedMotion, settings.autoplay, settings.autoplayMs, step]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canLoop) {
      return;
    }
    drag.current = { pointer: event.pointerId, startX: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    drag.current = null;
    if (!canLoop || !start || start.pointer !== event.pointerId) {
      return;
    }
    const delta = event.clientX - start.startX;
    if (Math.abs(delta) < SWIPE_PX) {
      return;
    }
    step(delta < 0 ? 1 : -1);
  };

  if (length === 0) {
    return <div className="min-w-0 flex-1" aria-hidden="true" />;
  }

  const longestCh = Math.max(...source.map((slide) => slide.text.length), 8);
  const canTransition = animate && !reducedMotion;

  return (
    <div className="flex min-w-0 flex-1 justify-center">
      <div
        className="flex max-w-full items-center gap-0.5"
        style={{ width: `min(100%, calc(${longestCh}ch + 2.5rem))` }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          type="button"
          className="shrink-0 p-0.5 text-current opacity-80 hover:opacity-100"
          aria-label="Previous promo"
          onClick={() => step(-1)}
        >
          <ArrowIcon dir="prev" />
        </button>

        <div
          className="min-w-0 flex-1 overflow-hidden select-none"
          aria-roledescription="carousel"
          aria-label="Promotions"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          <div
            className="flex"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translate3d(-${index * slidePct}%, 0, 0)`,
              transition: canTransition ? `transform ${PROMO_BAR_TRANSITION_MS}ms ease-in-out` : "none",
            }}
          >
            {slides.map((slide, slideIndex) => (
              <p
                key={`${slide.id}-${slideIndex}`}
                className="shrink-0 truncate px-1 text-center"
                style={{ width: `${slidePct}%` }}
                aria-hidden={slideIndex !== index}
              >
                {slide.text}
              </p>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="shrink-0 p-0.5 text-current opacity-80 hover:opacity-100"
          aria-label="Next promo"
          onClick={() => step(1)}
        >
          <ArrowIcon dir="next" />
        </button>
      </div>
    </div>
  );
}
