"use client";

import { useCallback, useEffect, useState } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Tooltip } from "radix-ui";
import useEmblaCarousel from "embla-carousel-react";
import MobileGalleryImage from "./MobileGalleryImage";
import HeroQuickBuy from "./HeroQuickBuy";
import GalleryPreview from "./GalleryPreview";
import type { ProductCarouselImage, ProductVariant } from "@/lib/data/products";

type Props = {
  images: ProductCarouselImage[];
  name: string;
  description: string;
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  activeIndex: number;
  onSelect: (index: number) => void;
  onVariantChange: (variant: ProductVariant) => void;
  onQuickBuy: () => Promise<boolean>;
};

// If the hero image never reports a load (e.g. a failed request), reveal anyway.
const REVEAL_FALLBACK_MS = 2500;

function formatCounter(value: number) {
  return String(value).padStart(2, "0");
}

function createArrowCursor(direction: "left" | "right", color: "black" | "white") {
  const paths =
    direction === "left"
      ? '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>'
      : '<path d="m12 5 7 7-7 7"/><path d="M5 12h14"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 16 16, ${direction === "left" ? "w-resize" : "e-resize"}`;
}

export default function ProductGallery({
  images,
  name,
  description,
  variants,
  selectedVariant,
  activeIndex,
  onSelect,
  onVariantChange,
  onQuickBuy,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: images.length > 1,
    watchDrag: (_, event) => {
      if ("touches" in event && event.touches.length > 1) return false;
      return !(
        event.target instanceof Element && event.target.closest('[data-gallery-zoomed="true"]')
      );
    },
  });
  const reducedMotion = useReducedMotion();
  const activeImage = images[activeIndex] ?? images[0];
  const uiTheme = activeImage?.uiTheme ?? "dark";
  const cursorColor = uiTheme === "light" ? "white" : "black";
  // The first hero image eases in once it has actually loaded; the quick-buy text follows.
  const [heroLoaded, setHeroLoaded] = useState(false);
  const revealed = heroLoaded || !!reducedMotion;

  useEffect(() => {
    if (heroLoaded) return;
    const timer = window.setTimeout(() => setHeroLoaded(true), REVEAL_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [heroLoaded]);

  const imageAlt = (index: number) =>
    `${name} lamp in ${selectedVariant.color}, view ${index + 1} of ${images.length}`;

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const handleSelect = () => onSelect(emblaApi.selectedScrollSnap());
    emblaApi.on("select", handleSelect);
    return () => {
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi, onSelect]);

  // Keep the carousel in sync when the active image changes outside of a swipe
  // (e.g. a variant switch resets the index to 0).
  useEffect(() => {
    if (!emblaApi) return;
    if (emblaApi.selectedScrollSnap() !== activeIndex) {
      emblaApi.scrollTo(activeIndex);
    }
  }, [emblaApi, activeIndex]);

  return (
    <div
      className="product-hero relative left-1/2 aspect-[864/1147] h-auto w-screen -translate-x-1/2 overflow-hidden md:aspect-auto md:h-[clamp(540px,calc(100svh-44px),840px)]"
      data-ui-theme={uiTheme}
    >
      <nav
        aria-label="Breadcrumb"
        className="absolute inset-x-0 top-14 z-30 mx-auto flex max-w-[1240px] items-center gap-2.5 px-5 py-4 text-[13.5px] md:top-28 md:px-6 lg:px-8"
      >
        <Link
          href="/"
          className="font-medium text-[var(--hero-ui-muted)] transition-colors hover:text-[var(--color-accent-amber)]"
        >
          Home
        </Link>
        <span className="text-[var(--hero-ui-subtle)]">/</span>
        <Link
          href="/collection"
          className="font-medium text-[var(--hero-ui-muted)] transition-colors hover:text-[var(--color-accent-amber)]"
        >
          Collection
        </Link>
        <span className="text-[var(--hero-ui-subtle)]">/</span>
        <span aria-current="page" className="font-semibold text-[var(--hero-ui-color)]">
          {name}
        </span>
      </nav>

      <div ref={emblaRef} className="relative h-full overflow-hidden">
        <div className="flex h-full touch-pan-y md:opacity-0">
          {images.map((image, index) => (
            <div
              key={image.src}
              className="relative h-full min-w-0 flex-[0_0_100%]"
              aria-hidden={index !== activeIndex}
            >
              <div className="h-full md:hidden">
                <MobileGalleryImage
                  key={image.mobileSrc ?? image.src}
                  src={image.mobileSrc ?? image.src}
                  alt={imageAlt(index)}
                  priority={index === 0}
                  active={index === activeIndex}
                />
              </div>
              <picture className="relative hidden h-full md:block">
                {image.mobileSrc && (
                  <source
                    media="(max-width: 767px)"
                    sizes="(max-width: 440px) 100vw, 440px"
                    srcSet={
                      getImageProps({
                        src: image.mobileSrc,
                        alt: "",
                        fill: true,
                        sizes: "(max-width: 440px) 100vw, 440px",
                        // Same URL as MobileGalleryImage's slide, so it must agree on loading
                        // or Next's LCP check reads the slide as lazy.
                        loading: index === 0 ? "eager" : "lazy",
                      }).props.srcSet
                    }
                  />
                )}
                <Image
                  src={image.src}
                  alt={imageAlt(index)}
                  width={2880}
                  height={1496}
                  sizes="(max-width: 440px) 100vw, (max-width: 767px) 440px, 100vw"
                  loading={index === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 mx-auto h-full w-full max-w-[440px] object-contain md:max-w-none md:object-cover"
                />
              </picture>
            </div>
          ))}
        </div>

        {activeImage && (
          <motion.div
            className="pointer-events-none absolute inset-0 hidden md:block"
            aria-hidden="true"
            initial={reducedMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
            transition={{
              opacity: { duration: 0.9, ease: "easeOut" },
              scale: { duration: 1.4, ease: [0.2, 0.8, 0.2, 1] },
            }}
          >
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={activeImage.src}
                className="pointer-events-none absolute inset-0 hidden md:block"
                aria-hidden="true"
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.4, ease: "easeInOut" }}
              >
                <picture className="relative block h-full">
                  <Image
                    src={activeImage.src}
                    alt=""
                    width={2880}
                    height={1496}
                    sizes="(max-width: 440px) 100vw, (max-width: 767px) 440px, 100vw"
                    loading="eager"
                    onLoad={() => setHeroLoaded(true)}
                    className="absolute inset-0 mx-auto h-full w-full max-w-[440px] object-contain [animation:none] md:max-w-none md:object-cover"
                  />
                </picture>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {images.length > 1 && (
          <>
            <div
              className="absolute inset-y-0 left-0 z-10 hidden w-1/2 md:block"
              style={{ cursor: createArrowCursor("left", cursorColor) }}
              onClick={scrollPrev}
              aria-hidden="true"
            />
            <div
              className="absolute inset-y-0 right-0 z-10 hidden w-1/2 md:block"
              style={{ cursor: createArrowCursor("right", cursorColor) }}
              onClick={scrollNext}
              aria-hidden="true"
            />
          </>
        )}
      </div>

      <HeroQuickBuy
        name={name}
        description={description}
        price={selectedVariant.price}
        uiTheme={uiTheme}
        revealed={revealed}
        onBuyNow={onQuickBuy}
      />

      <Tooltip.Provider delayDuration={0}>
        <div
          role="group"
          aria-label="Choose lamp color"
          className="glass-backdrop absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/60 px-2 py-1.5 shadow-sm md:bottom-auto md:left-8 md:top-1/2 md:translate-x-0 md:-translate-y-1/2 md:flex-col md:gap-2 md:px-1.5 md:py-3"
        >
          {variants.map((variant) => (
            <Tooltip.Root key={variant.id}>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={() => onVariantChange(variant)}
                  className="grid h-11 w-11 place-items-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-amber)] focus-visible:ring-offset-2 md:h-8 md:w-8"
                  aria-label={`View ${name} in ${variant.color}`}
                  aria-pressed={selectedVariant.id === variant.id}
                >
                  <span
                    aria-hidden="true"
                    className="h-9 w-9 rounded-full border-2 border-white md:h-7 md:w-7"
                    style={{
                      backgroundColor: variant.colorHex,
                      boxShadow:
                        selectedVariant.id === variant.id
                          ? "0 0 0 2px var(--color-accent-amber)"
                          : "0 0 0 1px var(--color-border)",
                    }}
                  />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={10}
                  className="z-50 rounded-md bg-[var(--color-text-primary)] px-2.5 py-1.5 text-xs font-medium text-white shadow-md"
                >
                  {variant.color}
                  <Tooltip.Arrow className="fill-[var(--color-text-primary)]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ))}
        </div>
      </Tooltip.Provider>

      <GalleryPreview
        images={images}
        name={name}
        color={selectedVariant.color}
        activeIndex={activeIndex}
        onSelect={(index) => emblaApi?.scrollTo(index)}
      />

      {images.length > 1 && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-40 flex -translate-y-1/2 items-center justify-between px-[6px] md:inset-x-auto md:right-10 md:top-auto md:bottom-10 md:translate-y-0 md:rounded-full md:bg-white/95 md:px-1">
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous image"
              className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full text-[var(--hero-ui-color)] outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-offset-2 md:h-10 md:w-10 md:text-[var(--color-text-primary)] pointer-coarse:min-h-11 pointer-coarse:min-w-11"
            >
              <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <span className="hidden min-w-12 text-center text-xs font-medium tabular-nums tracking-[0.08em] text-[var(--color-text-primary)] md:block" aria-hidden="true">
              {formatCounter(activeIndex + 1)} / {formatCounter(images.length)}
            </span>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next image"
              className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full text-[var(--hero-ui-color)] outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-offset-2 md:h-10 md:w-10 md:text-[var(--color-text-primary)] pointer-coarse:min-h-11 pointer-coarse:min-w-11"
            >
              <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {selectedVariant.color}: image {activeIndex + 1} of {images.length}
          </p>
        </>
      )}
    </div>
  );
}
