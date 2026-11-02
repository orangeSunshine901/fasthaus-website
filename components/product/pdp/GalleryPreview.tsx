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
    // Keep the selection visible in either layout without moving the page.
    const centerSelected = () => {
      preview.scrollTop = selected.offsetTop - (preview.clientHeight - selected.offsetHeight) / 2;
      preview.scrollLeft = selected.offsetLeft - (preview.clientWidth - selected.offsetWidth) / 2;
    };
    centerSelected();
    const observer = new ResizeObserver(centerSelected);
    observer.observe(preview);
    return () => observer.disconnect();
  }, [activeIndex, images]);

  if (images.length < 2) return null;

  return (
    <div
      ref={previewRef}
      role="group"
      aria-label="Image previews"
      className="glass-backdrop relative z-20 mx-auto my-3 flex w-max max-w-[calc(100%_-_2.5rem)] touch-pan-x gap-2.5 overflow-x-auto overscroll-contain rounded-2xl border border-white/60 bg-black/5 p-2.5 [scrollbar-width:thin] md:absolute md:right-8 md:top-1/2 md:m-0 md:max-h-[calc(100%_-_20rem)] md:max-w-none md:-translate-y-1/2 md:touch-auto md:flex-col md:overflow-x-hidden md:overflow-y-auto md:bg-transparent"
    >
      {images.map((image, index) => (
        <button
          key={image.src}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`View ${name} in ${color}, image ${index + 1} of ${images.length}`}
          aria-pressed={index === activeIndex}
          className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)] aria-pressed:opacity-100 aria-pressed:ring-2 aria-pressed:ring-[var(--color-accent-amber)] aria-pressed:ring-offset-2 aria-pressed:ring-offset-transparent md:h-16 md:w-14 md:focus-visible:outline-[var(--hero-ui-color)]"
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
