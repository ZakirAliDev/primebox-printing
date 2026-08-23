"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { heroRealIndex, heroSnapIndex } from "@/lib/hero-slides";

const AUTOPLAY_MS = 5000;
const TRANSITION_MS = 500;
const THUMB_TRANSITION_MS = 300;
const VISIBLE_THUMBS = 5;
const FOCUS_SLOT = 2;
const THUMB_GAP = "0.5rem";
const THUMB_SWIPE_PX = 48;
const THUMB_SIZE = `calc((100% - 4 * ${THUMB_GAP}) / 5)`;

function loopImages(images: string[]) {
  if (images.length === 0) {
    return [];
  }
  return [images[images.length - 1], ...images, images[0]];
}

function initialActiveIndex(total: number) {
  return Math.min(Math.floor(total / 2), total - 1);
}

function thumbScrollForActive(active: number, total: number) {
  if (total <= VISIBLE_THUMBS) {
    return 0;
  }
  const max = total - VISIBLE_THUMBS;
  return Math.max(0, Math.min(active - FOCUS_SLOT, max));
}

function leadingSlotsForActive(active: number, total: number) {
  return Math.max(3 - total, Math.min(5 - total, FOCUS_SLOT - active));
}

function focusSlotForActive(active: number, total: number, scroll: number) {
  if (total <= VISIBLE_THUMBS) {
    return FOCUS_SLOT;
  }
  return active - scroll;
}

function FocusCorners() {
  return (
    <>
      <span className="pointer-events-none absolute left-1 top-1 h-3 w-3 border-l-2 border-t-2 border-yellow" />
      <span className="pointer-events-none absolute right-1 top-1 h-3 w-3 border-r-2 border-t-2 border-yellow" />
      <span className="pointer-events-none absolute bottom-1 left-1 h-3 w-3 border-b-2 border-l-2 border-yellow" />
      <span className="pointer-events-none absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-yellow" />
    </>
  );
}

function ThumbArrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3 w-3">
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

function ThumbButton({
  src,
  imageIndex,
  length,
  activeIndex,
  onSelect,
}: {
  src: string;
  imageIndex: number;
  length: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const active = imageIndex === activeIndex;
  return (
    <button
      type="button"
      onClick={() => onSelect(imageIndex)}
      aria-label={`Show image ${imageIndex + 1} of ${length}`}
      aria-current={active ? "true" : undefined}
      className={`block w-full overflow-hidden rounded border border-transparent transition-all ${
        active ? "" : "opacity-55 saturate-50 hover:opacity-80 hover:saturate-100"
      }`}
    >
      <img src={src} alt="" className="aspect-square w-full bg-navy/5 object-contain" draggable={false} />
    </button>
  );
}

function FocusFrame({ slot }: { slot: number }) {
  return (
    <div
      className="product-gallery-focus pointer-events-none absolute top-0 z-10 aspect-square"
      style={{
        width: "var(--thumb-size)",
        left: `calc(${slot} * (var(--thumb-size) + var(--thumb-gap)))`,
      }}
    >
      <FocusCorners />
    </div>
  );
}

export function ProductGallery({
  image,
  gallery,
  name,
}: {
  image?: string;
  gallery?: string[];
  name: string;
}) {
  const images = useMemo(
    () =>
      [image, ...(gallery ?? [])].filter((value, index, list): value is string =>
        Boolean(value) && list.indexOf(value) === index,
      ),
    [gallery, image],
  );
  const length = images.length;
  const loopSlides = useMemo(() => loopImages(images), [images]);
  const slidePct = loopSlides.length ? 100 / loopSlides.length : 0;
  const maxThumbScroll = Math.max(0, length - VISIBLE_THUMBS);
  const showThumbArrows = length > VISIBLE_THUMBS;
  const thumbViewportStyle = {
    "--thumb-gap": THUMB_GAP,
    "--thumb-size": THUMB_SIZE,
  } as CSSProperties;

  const [index, setIndex] = useState(() => initialActiveIndex(length) + 1);
  const [activeIndex, setActiveIndex] = useState(() => initialActiveIndex(length));
  const [thumbScroll, setThumbScroll] = useState(() => thumbScrollForActive(initialActiveIndex(length), length));
  const [thumbAnimate, setThumbAnimate] = useState(false);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const thumbDrag = useRef<{ pointer: number; startX: number } | null>(null);

  const leadingSlots = leadingSlotsForActive(activeIndex, length);
  const focusSlot = focusSlotForActive(activeIndex, length, thumbScroll);

  const syncMainToActive = useCallback((nextActive: number) => {
    setActiveIndex(nextActive);
    setAnimate(true);
    setIndex(nextActive + 1);
  }, []);

  const applyActive = useCallback(
    (nextActive: number) => {
      setThumbAnimate(false);
      setThumbScroll(thumbScrollForActive(nextActive, length));
      syncMainToActive(nextActive);
    },
    [length, syncMainToActive],
  );

  const scrollThumbs = useCallback(
    (delta: number) => {
      if (!showThumbArrows) {
        return;
      }
      setThumbAnimate(true);
      setThumbScroll((current) => {
        const nextScroll = Math.max(0, Math.min(maxThumbScroll, current + delta));
        syncMainToActive(nextScroll + FOCUS_SLOT);
        return nextScroll;
      });
    },
    [maxThumbScroll, showThumbArrows, syncMainToActive],
  );

  const onThumbPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!showThumbArrows) {
        return;
      }
      thumbDrag.current = { pointer: event.pointerId, startX: event.clientX };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [showThumbArrows],
  );

  const onThumbPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const start = thumbDrag.current;
      thumbDrag.current = null;
      if (!start || start.pointer !== event.pointerId || !showThumbArrows) {
        return;
      }
      const delta = event.clientX - start.startX;
      if (Math.abs(delta) < THUMB_SWIPE_PX) {
        return;
      }
      scrollThumbs(delta < 0 ? 1 : -1);
    },
    [scrollThumbs, showThumbArrows],
  );

  const onThumbPointerCancel = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (thumbDrag.current?.pointer === event.pointerId) {
      thumbDrag.current = null;
    }
  }, []);

  const step = useCallback((delta: number) => {
    setAnimate(true);
    setIndex((current) => current + delta);
  }, []);

  useEffect(() => {
    const start = initialActiveIndex(length);
    setThumbAnimate(false);
    setThumbScroll(thumbScrollForActive(start, length));
    setActiveIndex(start);
    setAnimate(true);
    setIndex(start + 1);
  }, [images, length]);

  useEffect(() => {
    const snapped = heroSnapIndex(index, length);
    if (snapped === index) {
      return;
    }
    const timer = window.setTimeout(() => {
      setAnimate(false);
      setIndex(snapped);
    }, TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [index, length]);

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
    const real = heroRealIndex(index, length);
    setThumbAnimate(false);
    setActiveIndex(real);
    setThumbScroll(thumbScrollForActive(real, length));
  }, [index, length]);

  useEffect(() => {
    if (length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => step(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [index, length, paused, step]);

  if (length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-navy/5 text-sm text-navy/40">
        Product gallery
      </div>
    );
  }

  return (
    <div
      className="product-gallery"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <div
        className="aspect-square w-full overflow-hidden rounded-xl bg-navy/5"
        aria-roledescription="carousel"
        aria-label={`${name} gallery`}
      >
        <div
          className="product-gallery-track flex h-full"
          style={{
            width: `${loopSlides.length * 100}%`,
            transform: `translate3d(-${index * slidePct}%, 0, 0)`,
            transition: animate ? `transform ${TRANSITION_MS}ms ease-in-out` : "none",
          }}
        >
          {loopSlides.map((src, slideIndex) => (
            <img
              key={`${src}-${slideIndex}`}
              src={src}
              alt={heroRealIndex(slideIndex, length) === activeIndex ? name : `${name} view`}
              className="h-full shrink-0 object-cover"
              style={{ width: `${slidePct}%` }}
              draggable={false}
              aria-hidden={heroRealIndex(slideIndex, length) !== activeIndex}
            />
          ))}
        </div>
      </div>

      {length > 1 ? (
        <div className="mt-3 flex items-start gap-1.5">
          {showThumbArrows ? (
            <button
              type="button"
              className="mt-[calc(var(--thumb-size)/2-0.75rem)] hidden h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy/15 text-navy/70 hover:border-navy/30 hover:text-navy disabled:opacity-40 md:flex"
              aria-label="Scroll thumbnails back"
              onClick={() => scrollThumbs(-1)}
              disabled={thumbScroll === 0}
              style={thumbViewportStyle}
            >
              <ThumbArrow dir="prev" />
            </button>
          ) : null}

          <div
            className="relative min-w-0 flex-1 touch-pan-y"
            style={thumbViewportStyle}
            aria-label="Gallery thumbnails"
            onPointerDown={showThumbArrows ? onThumbPointerDown : undefined}
            onPointerUp={showThumbArrows ? onThumbPointerUp : undefined}
            onPointerCancel={showThumbArrows ? onThumbPointerCancel : undefined}
          >
            {length <= VISIBLE_THUMBS ? (
              <div className="grid grid-cols-5 gap-[var(--thumb-gap)]">
                {Array.from({ length: VISIBLE_THUMBS }, (_, slot) => {
                  const imageIndex = slot - leadingSlots;
                  if (imageIndex < 0 || imageIndex >= length) {
                    return <div key={`empty-${slot}`} className="aspect-square w-full" aria-hidden="true" />;
                  }
                  return (
                    <div key={images[imageIndex]} className="aspect-square w-full">
                      <ThumbButton
                        src={images[imageIndex]}
                        imageIndex={imageIndex}
                        length={length}
                        activeIndex={activeIndex}
                        onSelect={applyActive}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-hidden">
                <ul
                  className="product-gallery-thumb-track flex gap-[var(--thumb-gap)]"
                  style={{
                    transform: `translateX(calc(-${thumbScroll} * (var(--thumb-size) + var(--thumb-gap))))`,
                    transition: thumbAnimate ? `transform ${THUMB_TRANSITION_MS}ms ease-in-out` : "none",
                  }}
                >
                  {images.map((src, imageIndex) => (
                    <li key={src} className="aspect-square shrink-0" style={{ width: "var(--thumb-size)" }}>
                      <ThumbButton
                        src={src}
                        imageIndex={imageIndex}
                        length={length}
                        activeIndex={activeIndex}
                        onSelect={applyActive}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <FocusFrame slot={focusSlot} />
          </div>

          {showThumbArrows ? (
            <button
              type="button"
              className="mt-[calc(var(--thumb-size)/2-0.75rem)] hidden h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy/15 text-navy/70 hover:border-navy/30 hover:text-navy disabled:opacity-40 md:flex"
              aria-label="Scroll thumbnails forward"
              onClick={() => scrollThumbs(1)}
              disabled={thumbScroll >= maxThumbScroll}
              style={thumbViewportStyle}
            >
              <ThumbArrow dir="next" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
