"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Tooltip } from "radix-ui";
import useEmblaCarousel from "embla-carousel-react";
import type { ProductCarouselImage, ProductVariant } from "@/lib/data/products";

type Props = {
  images: ProductCarouselImage[];
  name: string;
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  activeIndex: number;
  onSelect: (index: number) => void;
  onVariantChange: (variant: ProductVariant) => void;
};

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
  variants,
  selectedVariant,
  activeIndex,
  onSelect,
  onVariantChange,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const reducedMotion = useReducedMotion();
  const activeImage = images[activeIndex] ?? images[0];
  const uiTheme = activeImage?.uiTheme ?? "dark";
  const cursorColor = uiTheme === "light" ? "white" : "black";

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
      className="product-hero relative left-1/2 aspect-[864/1147] h-auto w-screen -translate-x-1/2 overflow-hidden md:aspect-auto md:h-[840px]"
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
        <span className="font-semibold text-[var(--hero-ui-color)]">{name}</span>
      </nav>

      <div ref={emblaRef} className="relative h-full overflow-hidden">
        <div className="flex h-full touch-pan-y md:opacity-0">
          {images.map((image, index) => (
            <div
              key={image.src}
              className="relative h-full min-w-0 flex-[0_0_100%]"
              aria-hidden={index !== activeIndex}
            >
              <picture>
                {image.mobileSrc && <source media="(max-width: 767px)" srcSet={image.mobileSrc} />}
                <Image
                  src={image.src}
                  alt={`${name} — image ${index + 1} of ${images.length}`}
                  fill
                  sizes="100vw"
                  className="mx-auto max-w-[440px] object-contain md:max-w-none md:object-cover"
                />
              </picture>
            </div>
          ))}
        </div>

        {activeImage && (
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
              <picture>
                {activeImage.mobileSrc && (
                  <source media="(max-width: 767px)" srcSet={activeImage.mobileSrc} />
                )}
                <Image
                  src={activeImage.src}
                  alt=""
                  fill
                  sizes="100vw"
                  className="mx-auto max-w-[440px] object-contain [animation:none] md:max-w-none md:object-cover"
                  priority={activeIndex === 0}
                />
              </picture>
            </motion.div>
          </AnimatePresence>
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

      <Tooltip.Provider delayDuration={0}>
        <div
          role="group"
          aria-label="Choose lamp color"
          className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/60 px-3.5 py-2.5 shadow-sm backdrop-blur-md md:bottom-auto md:left-8 md:top-1/2 md:translate-x-0 md:-translate-y-1/2 md:flex-col md:px-2.5 md:py-3.5"
        >
          {variants.map((variant) => (
            <Tooltip.Root key={variant.id}>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={() => onVariantChange(variant)}
                  className="h-8 w-8 rounded-full border-2 border-white transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-amber)] focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: variant.colorHex,
                    boxShadow:
                      selectedVariant.id === variant.id
                        ? "0 0 0 2px var(--color-accent-amber)"
                        : "0 0 0 1px var(--color-border)",
                  }}
                  aria-label={`View ${name} in ${variant.color}`}
                  aria-pressed={selectedVariant.id === variant.id}
                />
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

      {images.length > 1 && (
        <>
          <div className="absolute inset-x-0 top-1/2 z-40 flex -translate-y-1/2 justify-between px-[6px] md:hidden">
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous image"
              className="grid h-11 w-11 place-items-center outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: "var(--hero-ui-color)" }}
            >
              <ArrowLeft size={24} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next image"
              className="grid h-11 w-11 place-items-center outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: "var(--hero-ui-color)" }}
            >
              <ArrowRight size={24} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <div
            className="absolute right-4 z-40 hidden items-center md:right-10 md:flex"
            style={{ bottom: "calc(40px + env(safe-area-inset-bottom))" }}
          >
            <span
              className="min-w-[58px] text-center text-xs font-medium tabular-nums tracking-[0.08em]"
              style={{ color: "var(--hero-ui-color)" }}
            >
              {formatCounter(activeIndex + 1)} / {formatCounter(images.length)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
