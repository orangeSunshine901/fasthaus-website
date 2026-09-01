"use client";

import { useState } from "react";
import { motion } from "motion/react";

interface ExpandableGalleryProps {
  videos: string[];
  className?: string;
}

export function ExpandableGallery({ videos, className }: ExpandableGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (videos.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex h-72 w-full gap-2 md:h-[min(32vw,380px)] md:w-[calc(min(96vw,1140px)+48px)] md:gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={`${video}-${index}`}
            className="relative min-w-0 overflow-hidden rounded-[var(--radius-sm)]"
            initial={false}
            animate={{ flex: hoveredIndex === null ? 1 : hoveredIndex === index ? 2 : 0.5 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onMouseEnter={(event) => {
              setHoveredIndex(index);
              void event.currentTarget.querySelector("video")?.play();
            }}
            onMouseLeave={(event) => {
              setHoveredIndex(null);
              event.currentTarget.querySelector("video")?.pause();
            }}
          >
            <video
              src={video}
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 bg-black"
              initial={false}
              animate={{ opacity: hoveredIndex === index ? 0 : 0.28 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
