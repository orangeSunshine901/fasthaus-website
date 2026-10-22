import { useEffect, useRef } from "react";
import Image from "next/image";
import type { ProductCarouselImage } from "@/lib/data/products";

type Props = {
  images: ProductCarouselImage[];
  name: string;
  color: string;
  activeIndex: number;
  onSelect: (index: number) => void;
};

export default function GalleryPreview({ images, name, color, activeIndex, onSelect }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preview = previewRef.current;
    const selected = preview?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!preview || !selected) return;
    // Scroll only the thumbnail strip so gallery navigation never moves the page.
    preview.scrollTop = selected.offsetTop - (preview.clientHeight - selected.offsetHeight) / 2;
  }, [activeIndex, images]);

  if (images.length < 2) return null;

  return (
    <div
      ref={previewRef}
      role="group"
      aria-label="Image previews"
      className="glass-backdrop absolute right-8 top-1/2 z-20 hidden max-h-[calc(100%_-_20rem)] -translate-y-1/2 flex-col gap-3 overflow-y-auto overscroll-contain rounded-2xl border border-white/60 p-3 [scrollbar-width:thin] md:flex"
    >
      {images.map((image, index) => (
        <button
          key={image.src}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`View ${name} in ${color}, image ${index + 1} of ${images.length}`}
          aria-pressed={index === activeIndex}
          className="relative h-[72px] w-16 shrink-0 overflow-hidden rounded-lg opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hero-ui-color)] aria-pressed:opacity-100 aria-pressed:ring-2 aria-pressed:ring-[var(--color-accent-amber)] aria-pressed:ring-offset-2 aria-pressed:ring-offset-transparent"
        >
          <Image
            src={image.mobileSrc ?? image.src}
            alt=""
            fill
            sizes="192px"
            className="object-cover"
          />
        </button>
      ))}
    </div>
  );
}
