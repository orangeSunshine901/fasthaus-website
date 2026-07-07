"use client";

import { useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

type Props = {
  images: string[];
  name: string;
  activeIndex: number;
  onSelect: (index: number) => void;
};

function MobileCarousel({ images, name, activeIndex, onSelect }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel();

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
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden rounded-[14px]">
        <div className="flex touch-pan-y">
          {images.map((src, index) => (
            <div
              key={src}
              className="relative aspect-[5/4] min-w-0 flex-[0_0_100%]"
              style={{ backgroundColor: "var(--color-surface-muted)" }}
            >
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
        <>
          <span
            className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white"
            style={{ backgroundColor: "rgba(20, 17, 20, 0.55)" }}
          >
            {activeIndex + 1}/{images.length}
          </span>
          <div className="mt-3 flex justify-center">
            {images.map((src, index) => (
              <button
                key={src}
                onClick={() => onSelect(index)}
                aria-label={`Go to image ${index + 1}`}
                aria-current={index === activeIndex}
                className="grid h-8 w-8 place-items-center"
              >
                <span
                  className="block h-2 w-2 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      index === activeIndex
                        ? "var(--color-accent-amber)"
                        : "var(--color-border)",
                    transform: index === activeIndex ? "scale(1.25)" : "none",
                  }}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductGallery({ images, name, activeIndex, onSelect }: Props) {
  // Hero shows the active image; the grid shows up to 4 of the remaining ones.
  const thumbs = images
    .map((src, index) => ({ src, index }))
    .filter(({ index }) => index !== activeIndex)
    .slice(0, 4);

  return (
    <div className="lg:h-full lg:min-h-0">
      {/* Mobile: swipeable carousel */}
      <div className="md:hidden">
        <MobileCarousel
          images={images}
          name={name}
          activeIndex={activeIndex}
          onSelect={onSelect}
        />
      </div>

      {/* Desktop: hero + thumbnail grid */}
      <div className="hidden gap-3 md:grid md:grid-cols-[1fr_1fr_1.2fr] md:grid-rows-2 lg:h-full lg:min-h-0">
        <div
          className="relative col-start-3 row-span-2 row-start-1 h-full overflow-hidden rounded-[14px]"
          style={{ backgroundColor: "var(--color-surface-muted)" }}
        >
          <Image
            src={images[activeIndex] ?? images[0]}
            alt={name}
            fill
            sizes="40vw"
            className="object-cover"
            priority
          />
        </div>
        {thumbs.map(({ src, index }) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className="relative aspect-[5/4] overflow-hidden rounded-[14px] transition-opacity hover:opacity-90 lg:aspect-auto lg:min-h-0"
            style={{ backgroundColor: "var(--color-surface-muted)" }}
            aria-label={`View image ${index + 1} of ${name}`}
          >
            <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
