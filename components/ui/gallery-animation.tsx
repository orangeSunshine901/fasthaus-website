"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface ExpandableGalleryProps {
  images: string[];
  className?: string;
}

export function ExpandableGallery({ images, className }: ExpandableGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowRight") setSelectedIndex((index) => index === null ? null : (index + 1) % images.length);
      if (event.key === "ArrowLeft") setSelectedIndex((index) => index === null ? null : (index - 1 + images.length) % images.length);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, selectedIndex]);

  if (images.length === 0) return null;

  const selectNext = () => {
    setSelectedIndex((index) => (index === null ? null : (index + 1) % images.length));
  };

  const selectPrevious = () => {
    setSelectedIndex((index) => (index === null ? null : (index - 1 + images.length) % images.length));
  };

  return (
    <div className={className}>
      <div className="flex h-72 w-full gap-2 md:h-[min(32vw,380px)] md:w-[calc(min(96vw,1140px)+48px)] md:gap-6">
        {images.map((image, index) => (
          <motion.button
            key={image}
            type="button"
            className="relative min-w-0 cursor-pointer overflow-hidden rounded-[var(--radius-sm)] text-left"
            initial={false}
            animate={{ flex: hoveredIndex === null ? 1 : hoveredIndex === index ? 2 : 0.5 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex(null)}
            onClick={() => setSelectedIndex(index)}
            aria-label={`Open studio image ${index + 1}`}
          >
            <img src={image} alt="" className="h-full w-full object-cover" />
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 bg-black"
              initial={false}
              animate={{ opacity: hoveredIndex === index ? 0 : 0.28 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Studio image ${selectedIndex + 1} of ${images.length}`}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-white"
              onClick={() => setSelectedIndex(null)}
              aria-label="Close image gallery"
            >
              <X className="size-7" aria-hidden="true" />
            </button>

            {images.length > 1 && (
              <button
                type="button"
                className="absolute left-2 z-10 rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-white sm:left-4"
                onClick={(event) => {
                  event.stopPropagation();
                  selectPrevious();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="size-9" aria-hidden="true" />
              </button>
            )}

            <motion.img
              key={selectedIndex}
              src={images[selectedIndex]}
              alt={`Studio image ${selectedIndex + 1}`}
              className="max-h-[88vh] max-w-[calc(100vw-5rem)] rounded-[var(--radius-sm)] object-contain sm:max-w-[min(80rem,calc(100vw-10rem))]"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
            />

            {images.length > 1 && (
              <button
                type="button"
                className="absolute right-2 z-10 rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-white sm:right-4"
                onClick={(event) => {
                  event.stopPropagation();
                  selectNext();
                }}
                aria-label="Next image"
              >
                <ChevronRight className="size-9" aria-hidden="true" />
              </button>
            )}

            <span className="absolute bottom-4 rounded-full bg-white/15 px-3 py-1.5 text-sm text-white">
              {selectedIndex + 1} / {images.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
