"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

type Props = {
  images: string[];
  name: string;
  activeIndex: number;
  onSelect: (index: number) => void;
};

function formatCounter(value: number) {
  return String(value).padStart(2, "0");
}

export default function ProductGallery({ images, name, activeIndex, onSelect }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });

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
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full touch-pan-y">
          {images.map((src, index) => (
            <div key={src} className="relative h-full min-w-0 flex-[0_0_100%]">
              <Image
                src={src}
                alt={`${name} — image ${index + 1} of ${images.length}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-7 z-10 flex items-center justify-center gap-5 md:bottom-16 md:gap-7">
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
