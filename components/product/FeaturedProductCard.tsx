"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Tooltip } from "radix-ui";
import type { Product } from "@/lib/data/products";

type Props = {
  product: Product;
  summary: string;
  compactMobile?: boolean;
  activeMobile?: boolean;
};

export default function FeaturedProductCard({
  product,
  summary,
  compactMobile = false,
  activeMobile,
}: Props) {
  const defaultVariant = product.variants[0];
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const reducedMotion = useReducedMotion();
  const displayedImages = {
    off: selectedVariant.featuredImages.lightOff,
    on: selectedVariant.featuredImages.lightOn,
  };

  return (
    <article
      className={`group relative flex h-full flex-col rounded-[14px] border border-transparent transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#575757] ${
        compactMobile ? "gap-2 p-3 md:gap-3 md:p-4" : "gap-2 p-4 pt-0"
      }`}
      style={{
        backgroundColor: "#000104",
      }}
    >
      <div
        className={`media-rounded relative ${
          compactMobile ? "w-full" : displayedImages ? "-mx-4 w-[calc(100%+2rem)]" : "w-full"
        }`}
        style={{
          // backgroundColor: "#111111",
          aspectRatio: compactMobile ? "238 / 260" : displayedImages ? "1260 / 1720" : "238 / 325",
        }}
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={selectedVariant.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, ease: "easeInOut" }}
          >
            <Image
              src={displayedImages.off}
              alt={product.name}
              fill
              className={`md:scale-[1] object-cover transition-opacity duration-500 ${
                displayedImages
                  ? activeMobile === undefined
                    ? "opacity-100 group-hover:opacity-0"
                    : activeMobile
                      ? "opacity-0"
                      : "opacity-100 "
                  : ""
              }`}
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
            />
            <Image
              src={displayedImages.on}
              alt=""
              fill
              className={`md:scale-[1] object-cover transition-all duration-500  ${
                activeMobile === undefined
                  ? "opacity-0 group-hover:opacity-100"
                  : activeMobile
                    ? "opacity-100"
                    : "opacity-0"
              }`}
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className={`${compactMobile ? "mt-2 md:mt-4" : "mt-4"} flex justify-center transition-all duration-500 ${
          activeMobile === undefined
            ? "pointer-events-none translate-y-2 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100"
            : activeMobile
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0"
        }`}
        style={{ perspective: "1000px" }}
      >
        <Link
          href={`/product/${product.slug}?variant=${encodeURIComponent(selectedVariant.id)}`}
          className="glass-surface relative z-10 inline-flex -translate-y-4 items-center gap-2 overflow-hidden rounded-full px-4 py-2"
        >
          <span className="text-sm font-medium text-white font-['DM_Sans'] leading-5">
            View Product
          </span>
          <div className="w-5 h-5 relative">
            <Image src="/ArrowRight.svg" alt="" fill className="object-contain" />
          </div>
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <h3 className="type-title-sm" style={{ color: "#FFFFFF" }}>
          {product.name}
        </h3>
        <span
          className="type-caption inline-flex shrink-0 items-center gap-1"
          style={{ color: "#FFFFFF" }}
        >
          <Image src="/dirham-icon.svg" alt="AED" width={12} height={12} className="inline-block" />
          <span>{selectedVariant.price}</span>
        </span>
      </div>

      <p className="type-caption-sm" style={{ color: "#FFFFFF" }}>
        {summary}
      </p>

      <Tooltip.Provider delayDuration={0}>
        <div className="flex items-center gap-3 mt-1">
          {product.variants.map((variant) => (
            <Tooltip.Root key={variant.id}>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onPointerDown={compactMobile ? (event) => event.stopPropagation() : undefined}
                  onClick={() => setSelectedVariant(variant)}
                  className={`relative z-10 h-[16px] w-[16px] rounded-full border  transition-transform duration-200 ${
                    selectedVariant.id === variant.id ? "" : "hover:scale-[1.24]"
                  }`}
                  style={{
                    backgroundColor: variant.colorHex,
                    outline: selectedVariant.id === variant.id ? "2px solid white" : "none",
                    outlineOffset: "2px",
                  }}
                  aria-label={`Select ${variant.color}`}
                  aria-pressed={selectedVariant.id === variant.id}
                />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  sideOffset={6}
                  className="z-50 rounded-md bg-[var(--color-text-primary)] px-2.5 py-1.5 text-xs font-medium text-white shadow-md"
                >
                  {variant.color}
                  <Tooltip.Arrow className="fill-[var(--color-text-primary)]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ))}
        </div>
      </Tooltip.Provider>
    </article>
  );
}
