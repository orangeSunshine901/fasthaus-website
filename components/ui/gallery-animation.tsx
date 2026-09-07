"use client";

import { getImageProps } from "next/image";
import { useState } from "react";
import { motion } from "motion/react";

interface ExpandableGalleryProps {
  videos: { src: string; fallbackSrc?: string; poster: string }[];
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
            key={video.src}
            className="relative min-w-0 overflow-hidden rounded-[var(--radius-sm)]"
            initial={false}
            animate={{ flex: hoveredIndex === null ? 1 : hoveredIndex === index ? 2 : 0.5 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onMouseEnter={(event) => {
              if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

              setHoveredIndex(index);
              void event.currentTarget.querySelector("video")?.play();
            }}
            onMouseLeave={(event) => {
              if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

              setHoveredIndex(null);
              event.currentTarget.querySelector("video")?.pause();
            }}
            onPointerUp={(event) => {
              if (event.pointerType === "mouse") return;

              const media = event.currentTarget.querySelector("video");
              if (!media) return;

              if (media.paused) {
                event.currentTarget.parentElement?.querySelectorAll("video").forEach((item) => {
                  if (item !== media) item.pause();
                });
                setHoveredIndex(index);
                void media.play();
              } else {
                setHoveredIndex(null);
                media.pause();
              }
            }}
          >
            <video
              poster={
                getImageProps({
                  src: video.poster,
                  alt: "",
                  width: 640,
                  height: 360,
                }).props.src
              }
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              className="h-full w-full object-cover"
            >
              <source src={video.src} type="video/webm" />
              {video.fallbackSrc ? <source src={video.fallbackSrc} type="video/mp4" /> : null}
            </video>
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
