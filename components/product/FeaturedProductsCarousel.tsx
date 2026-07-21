"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { Product } from "@/lib/data/products";
import FeaturedProductCard from "@/components/product/FeaturedProductCard";

type Props = {
  products: Product[];
  summaries: Record<string, string>;
};

function ProductCard({
  product,
  summary,
  compactMobile = false,
  activeMobile,
}: {
  product: Product;
  summary: string;
  compactMobile?: boolean;
  activeMobile?: boolean;
}) {
  return (
    <FeaturedProductCard
      product={product}
      summary={summary}
      compactMobile={compactMobile}
      activeMobile={activeMobile}
    />
  );
}

export default function FeaturedProductsCarousel({ products, summaries }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [viewportVisibility, setViewportVisibility] = useState(0);
  const updateCarouselState = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", updateCarouselState).on("reInit", updateCarouselState);
    const animationFrame = requestAnimationFrame(updateCarouselState);

    return () => {
      cancelAnimationFrame(animationFrame);
      emblaApi.off("select", updateCarouselState).off("reInit", updateCarouselState);
    };
  }, [emblaApi, updateCarouselState]);

  useEffect(() => {
    const viewport = emblaApi?.rootNode();
    if (!viewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => setViewportVisibility(entry.intersectionRatio),
      { threshold: [0, 0.45, 1] }
    );

    observer.observe(viewport);
    return () => observer.disconnect();
  }, [emblaApi]);

  return (
    <>
      <div className="md:hidden">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="-ml-4 flex touch-pan-y">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="min-w-0 flex-[0_0_88%] pl-4"
                role="group"
                aria-label={`${product.name} slide ${index + 1}`}
              >
                <ProductCard
                  product={product}
                  summary={summaries[product.slug] ?? product.description}
                  compactMobile
                  activeMobile={
                    selectedIndex === index && viewportVisibility >= (index === 0 ? 0.65 : 0.45)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {scrollSnaps.length > 1 && (
          <div className="mt-6 flex justify-center gap-2" aria-label="Featured product slides">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  index === selectedIndex ? "w-6 bg-white" : "w-2 bg-white/35"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selectedIndex ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <div className="hidden grid-cols-2 gap-6 md:grid xl:grid-cols-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            data-scroll
            className={`scroll-reveal-up scroll-stagger-${Math.min(index + 1, 4)} h-full`}
          >
            <ProductCard
              product={product}
              summary={summaries[product.slug] ?? product.description}
            />
          </div>
        ))}
      </div>
    </>
  );
}
