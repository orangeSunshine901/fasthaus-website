"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { GALLERY_PORTRAITS } from "@/lib/data/gallery-portraits";

type Props = {
  src: string;
  alt: string;
  priority: boolean;
  active: boolean;
};

export default function MobileGalleryImage({ src, alt, priority, active }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  // Reset the transform imperatively when the slide goes inactive. Keying this
  // component on `active` instead would remount the <img> on every swipe, which
  // forces the browser to re-decode an already-loaded image. The reset reaches
  // `zoomed` through onTransform, so there is no setState to do here.
  useEffect(() => {
    if (active) return;
    transformRef.current?.resetTransform(0);
  }, [active]);

  return (
    <div className="h-full" data-gallery-zoomed={zoomed}>
      <TransformWrapper
        ref={transformRef}
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
            // Pinned across zoom levels: the portrait sources cap at 1080px wide
            // and the optimizer never enlarges, so a larger request returns the same
            // pixels — a second billed transform and download for no added detail.
            sizes="(max-width: 440px) 100vw, 440px"
            loading={priority ? "eager" : "lazy"}
            draggable={false}
            className="mx-auto max-w-[440px] select-none object-contain"
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
