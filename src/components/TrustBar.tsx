"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  relatedLoopBounds,
  relatedLoopItems,
  relatedSnapLoopIndex,
} from "@/lib/related-carousel";
import {
  TRUST_BAR_TRANSITION_MS,
  trustBarHasContent,
  type TrustBarImage,
  type TrustBarSettings,
} from "@/lib/trust-bar";

const GAP_PX = 24;
const SWIPE_PX = 40;
const MOBILE_BREAKPOINT = 768;

function TrustImageLink({
  item,
  className,
  onClick,
}: {
  item: TrustBarImage;
  className?: string;
  onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.image}
      alt={item.alt || ""}
      className={className ?? "h-full w-full object-contain"}
    />
  );

  if (!item.href) {
    return image;
  }

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-full w-full items-center justify-center"
      onClick={onClick}
    >
      {image}
    </a>
  );
}

function LogoCarousel({ settings }: { settings: TrustBarSettings["carousel"] }) {
  const items = settings.slides;
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef({ x: 0, y: 0, swiped: false });
  const [visible, setVisible] = useState(settings.slidesToShowMobile);
  const [slideWidth, setSlideWidth] = useState(0);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const loopSource = useMemo(() => items.map((slide) => ({ slug: slide.id, slide })), [items]);
  const bounds = useMemo(() => relatedLoopBounds(loopSource, visible), [loopSource, visible]);
  const loopItems = useMemo(() => relatedLoopItems(loopSource, visible), [loopSource, visible]);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const nextVisible =
      window.innerWidth >= MOBILE_BREAKPOINT
        ? settings.slidesToShowDesktop
        : settings.slidesToShowMobile;
    const width = viewport.clientWidth;
    const nextSlideWidth =
      nextVisible > 0 ? (width - GAP_PX * Math.max(nextVisible - 1, 0)) / nextVisible : width;
    setVisible(nextVisible);
    setSlideWidth(nextSlideWidth);
  }, [settings.slidesToShowDesktop, settings.slidesToShowMobile]);

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
    const snapped = relatedSnapLoopIndex(scrollIndex, loopSource, visible);
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
    }, TRUST_BAR_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [loopSource, reducedMotion, scrollIndex, visible]);

  useEffect(() => {
    if (animate) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAnimate(true));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [animate]);

  const step = useCallback((delta: number) => {
    setAnimate(true);
    setScrollIndex((current) => current + delta);
  }, []);

  useEffect(() => {
    if (paused || !settings.autoplay || reducedMotion || items.length === 0) {
      return;
    }
    const timer = window.setInterval(() => step(1), settings.autoplayMs);
    return () => window.clearInterval(timer);
  }, [items.length, paused, reducedMotion, settings.autoplay, settings.autoplayMs, step]);

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

  const stepPx = slideWidth + GAP_PX;
  const offsetPx = scrollIndex * stepPx;
  const canTransition = animate && !reducedMotion;

  return (
    <div
      className="min-w-0 flex-1"
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
        ref={viewportRef}
        className="w-full touch-pan-y select-none"
        aria-roledescription="carousel"
        aria-label="Brand logos"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="overflow-hidden">
          <ul
            className="flex items-center"
            style={{
              gap: GAP_PX,
              transform: `translate3d(-${offsetPx}px, 0, 0)`,
              transition: canTransition ? `transform ${TRUST_BAR_TRANSITION_MS}ms ease-in-out` : "none",
            }}
          >
            {loopItems.map((item, index) => (
              <li
                key={`${item.slug}-${index}`}
                className="flex h-16 shrink-0 items-center justify-center sm:h-20"
                style={{ width: slideWidth > 0 ? slideWidth : "100%" }}
              >
                <TrustImageLink
                  item={item.slide}
                  className="max-h-14 max-w-full object-contain sm:max-h-16"
                  onClick={onLinkClick}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function TrustBar({ settings }: { settings: TrustBarSettings }) {
  if (!trustBarHasContent(settings)) {
    return null;
  }

  const stills = settings.stills.filter((item) => item.image);

  return (
    <section className="border-b border-navy/5 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-6 px-4 py-6 md:flex-row md:items-center md:gap-8 md:py-8">
        {stills.length > 0 ? (
          <div className="flex shrink-0 items-center justify-center gap-4 md:justify-start md:gap-5">
            {stills.map((item) => (
              <div
                key={item.id}
                className="flex h-16 w-[140px] items-center justify-center sm:h-20 sm:w-[160px]"
              >
                <TrustImageLink item={item} className="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        ) : null}

        <LogoCarousel settings={settings.carousel} />
      </div>
    </section>
  );
}
