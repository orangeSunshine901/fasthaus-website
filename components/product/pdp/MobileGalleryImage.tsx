"use client";

import { useState } from "react";
import Image from "next/image";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { GALLERY_PORTRAITS } from "@/lib/data/gallery-portraits";

type Props = {
  src: string;
  alt: string;
  priority: boolean;
  active: boolean;
};

export default function MobileGalleryImage({ src, alt, priority, active }: Props) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="h-full" data-gallery-zoomed={zoomed}>
      <TransformWrapper
        disabled={!active}
        minScale={1}
        maxScale={4}
        wheel={{ disabled: true }}
        panning={{ disabled: !zoomed, velocityDisabled: true }}
        doubleClick={{ mode: zoomed ? "reset" : "zoomIn", step: 1, animationTime: 0 }}
        zoomAnimation={{ disabled: true }}
        onTransform={(_, { scale }) => setZoomed(scale > 1.01)}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%", touchAction: zoomed ? "none" : "pan-y" }}
          contentStyle={{ position: "relative", width: "100%", height: "100%" }}
        >
          <Image
            src={GALLERY_PORTRAITS[src] ?? src}
            alt={alt}
            fill
            sizes={zoomed ? "(max-width: 440px) 400vw, 1760px" : "(max-width: 440px) 100vw, 440px"}
            loading={priority ? "eager" : "lazy"}
            draggable={false}
            className="mx-auto max-w-[440px] select-none object-contain"
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
