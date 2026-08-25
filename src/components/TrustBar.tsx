"use client";

import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import {
  trustBarHasContent,
  trustBarMarqueeDurationMs,
  trustBarMarqueeSet,
  type TrustBarImage,
  type TrustBarSettings,
} from "@/lib/trust-bar";

const GAP_PX = 24;
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

function LogoCarousel({
  settings,
  slideHeight,
}: {
  settings: TrustBarSettings["carousel"];
  slideHeight: number;
}) {
  const items = settings.slides;
  const [visible, setVisible] = useState(settings.slidesToShowMobile);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const update = () => {
      setVisible(
        window.innerWidth >= MOBILE_BREAKPOINT
          ? settings.slidesToShowDesktop
          : settings.slidesToShowMobile,
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [settings.slidesToShowDesktop, settings.slidesToShowMobile]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const set = useMemo(() => trustBarMarqueeSet(items, visible), [items, visible]);
  const durationMs = trustBarMarqueeDurationMs(set.length, settings.autoplayMs);
  const animate = settings.autoplay && !reducedMotion && items.length > 0;

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className="trust-bar-viewport min-w-0 flex-1"
      style={
        {
          "--trust-bar-visible": String(visible),
          "--trust-bar-gap": `${GAP_PX}px`,
          "--trust-bar-duration": `${durationMs}ms`,
          "--trust-bar-slide-height": `${slideHeight}px`,
        } as CSSProperties
      }
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
        className={`trust-bar-marquee${animate ? "" : " is-static"}${paused && animate ? " is-paused" : ""}`}
        aria-label="Brand logos"
        role="region"
      >
        {[0, 1].map((copyIndex) => (
          <ul
            key={copyIndex}
            className="trust-bar-marquee__group"
            aria-hidden={copyIndex > 0}
          >
            {set.map((slide, index) => (
              <li key={`${slide.id}-${copyIndex}-${index}`} className="trust-bar-marquee__slide">
                <TrustImageLink
                  item={slide}
                  className="max-h-full max-w-full object-contain"
                />
              </li>
            ))}
          </ul>
        ))}
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
                className="flex items-center justify-center"
                style={{ height: settings.stillHeight, width: Math.round(settings.stillHeight * 2.2) }}
              >
                <TrustImageLink item={item} className="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        ) : null}

        <LogoCarousel settings={settings.carousel} slideHeight={settings.slideHeight} />
      </div>
    </section>
  );
}
