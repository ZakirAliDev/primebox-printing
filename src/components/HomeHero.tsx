"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { fontFamilyCss } from "@/lib/font-face";
import {
  DEFAULT_HERO_BUTTON_HREF,
  DEFAULT_HERO_BUTTON_LABEL,
  heroLoopSlides,
  heroRealIndex,
  heroSnapIndex,
  type HeroSettings,
  type HeroTextStyle,
} from "@/lib/hero-slides";

function textStyle(style: HeroTextStyle, extra?: CSSProperties): CSSProperties {
  return {
    fontFamily: fontFamilyCss(style.fontFamily),
    fontSize: `${style.fontSize}px`,
    lineHeight: 1.2,
    ...extra,
  };
}

function ArrowIcon({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeHero({ hero }: { hero: HeroSettings }) {
  const source = hero.slides;
  const length = source.length;
  const slides = useMemo(() => heroLoopSlides(source), [source]);
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const drag = useRef<{ pointer: number; startX: number } | null>(null);
  const slidePct = slides.length ? 100 / slides.length : 0;

  const step = useCallback((delta: number) => {
    setAnimate(true);
    setIndex((current) => current + delta);
  }, []);

  useEffect(() => {
    setIndex(1);
  }, [length]);

  useEffect(() => {
    const snapped = heroSnapIndex(index, length);
    if (snapped === index) {
      return;
    }
    const timer = window.setTimeout(() => {
      setAnimate(false);
      setIndex(snapped);
    }, hero.transitionMs);
    return () => window.clearTimeout(timer);
  }, [index, length, hero.transitionMs]);

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
    if (paused || !hero.autoplay || length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => step(1), hero.autoplayMs);
    return () => window.clearInterval(timer);
  }, [paused, step, index, hero.autoplay, hero.autoplayMs, length]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = { pointer: event.pointerId, startX: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    drag.current = null;
    if (!start || start.pointer !== event.pointerId) {
      return;
    }
    const delta = event.clientX - start.startX;
    if (Math.abs(delta) < 48) {
      return;
    }
    step(delta < 0 ? 1 : -1);
  };

  const real = heroRealIndex(index, length);

  if (length === 0) {
    return null;
  }

  return (
    <section
      className={`home-hero relative overflow-hidden ${
        hero.showArrows && hero.arrowsOnHover ? "home-hero-arrows-hover" : ""
      }`}
      style={{
        backgroundColor: hero.background || "#ffffff",
        height: `${hero.height || 430}px`,
      }}
      aria-roledescription="carousel"
      aria-label="Featured packaging"
      onMouseEnter={() => {
        if (hero.pauseOnHover) {
          setPaused(true);
        }
      }}
      onMouseLeave={() => setPaused(false)}
    >
      {hero.backgroundImage ? (
        <img
          src={hero.backgroundImage}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="relative mx-auto h-full max-w-[1320px] md:px-[100px]">
        {hero.showArrows && length > 1 ? (
          <>
            <button
              type="button"
              className="home-hero-arrow left-2.5 hidden md:flex"
              aria-label="Previous slide"
              onClick={() => step(-1)}
            >
              <ArrowIcon dir="prev" />
            </button>
            <button
              type="button"
              className="home-hero-arrow right-10 hidden md:flex"
              aria-label="Next slide"
              onClick={() => step(1)}
            >
              <ArrowIcon dir="next" />
            </button>
          </>
        ) : null}

        <div
          className="h-full overflow-hidden select-none"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          <div
            className="flex h-full"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translate3d(-${index * slidePct}%, 0, 0)`,
              transition: animate ? `transform ${hero.transitionMs}ms linear` : "none",
            }}
          >
            {slides.map((slide, slideIndex) => {
              const Title = slideIndex === 1 ? "h1" : "p";
              return (
                <article
                  key={`${slide.id}-${slideIndex}`}
                  className="h-full shrink-0"
                  style={{ width: `${slidePct}%` }}
                  aria-hidden={slideIndex !== index}
                >
                  <div
                    className="flex h-full flex-col-reverse items-center justify-between gap-6 px-4 md:flex-row md:items-stretch md:px-0"
                    style={{
                      paddingTop: `${hero.paddingTop ?? 40}px`,
                      paddingBottom: `${hero.paddingBottom ?? 40}px`,
                    }}
                  >
                    <div className="flex h-full w-full flex-col items-center justify-between text-center md:w-1/2 md:items-start md:pr-6 md:text-left">
                      <div>
                        <Title
                          className={`mb-[15px] font-black ${hero.animateHeading ? "hero-scan" : "text-navy"}`}
                          style={textStyle(hero.typography.heading)}
                        >
                          {slide.heading}
                        </Title>
                        {slide.lines[0] ? (
                          <p className="mb-2.5 text-navy" style={textStyle(hero.typography.subheading, { lineHeight: 1.5 })}>
                            {slide.lines[0]}
                          </p>
                        ) : null}
                        {slide.lines[1] ? (
                          <p className="mb-2.5 text-navy" style={textStyle(hero.typography.supporting, { lineHeight: 1.5 })}>
                            {slide.lines[1]}
                          </p>
                        ) : null}
                      </div>
                      <Link
                        href={slide.buttonHref || DEFAULT_HERO_BUTTON_HREF}
                        tabIndex={heroRealIndex(slideIndex, length) === real ? 0 : -1}
                        className="mt-4 inline-flex min-h-[50px] w-[61%] items-center justify-center rounded-full bg-button px-8 py-3 font-bold text-button-text hover:bg-[#ff8c00] md:mt-0 md:w-[262px]"
                        style={textStyle(hero.typography.button)}
                      >
                        {slide.buttonLabel || DEFAULT_HERO_BUTTON_LABEL}
                      </Link>
                    </div>
                    <div className="flex h-full min-h-0 w-full items-center justify-center md:w-1/2">
                      {slide.image ? (
                        <img
                          src={slide.image}
                          alt={slide.alt}
                          className="h-full max-h-full w-full object-contain object-center transition-transform duration-500 ease-in-out hover:scale-[1.04]"
                          draggable={false}
                        />
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
