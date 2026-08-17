"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Tooltip } from "radix-ui";
import useEmblaCarousel from "embla-carousel-react";
import type { ProductVariant } from "@/lib/data/products";

type Props = {
  images: string[];
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
      className="relative left-1/2 h-[calc(100svh-2.75rem)] w-screen -translate-x-1/2 overflow-hidden"
      style={{ backgroundColor: "#fdfbd4" }}
    >
      <div ref={emblaRef} className="relative h-full overflow-hidden">
        <div aria-hidden="true" className="flex h-full touch-pan-y opacity-0">
          {images.map((src, index) => (
            <div key={index} className="relative h-full min-w-0 flex-[0_0_100%]">
              <Image src={src} alt="" fill sizes="100vw" className="object-cover" />
            </div>
          ))}
        </div>

        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={images[activeIndex]}
            className="pointer-events-none absolute inset-0"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.4, ease: "easeInOut" }}
          >
            <Image
              src={images[activeIndex]}
              alt={`${name} — image ${activeIndex + 1} of ${images.length}`}
              fill
              sizes="100vw"
              className="object-cover [animation:none]"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <Tooltip.Provider delayDuration={0}>
        <div
          role="group"
          aria-label="Choose lamp color"
          className="absolute left-5 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3 rounded-full border border-white/60 px-2.5 py-3.5 shadow-sm backdrop-blur-md md:left-8"
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
        <div className="absolute inset-x-0 bottom-7 z-10 flex items-center justify-center gap-5 md:bottom-4 md:gap-7">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous image"
            className="grid h-11 w-11 place-items-center outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            <ArrowLeft size={32} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <span
            className="min-w-[66px] text-center text-sm font-semibold tabular-nums tracking-[0.08em]"
            style={{ color: "var(--color-text-primary)" }}
          >
            {formatCounter(activeIndex + 1)} / {formatCounter(images.length)}
          </span>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next image"
            className="grid h-11 w-11 place-items-center outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            <ArrowRight size={32} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
