"use client";

import { type MouseEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/data/products";
import DirhamPrice from "@/components/ui/DirhamPrice";

type Props = {
  product: Product;
  showRating?: boolean;
};

const badgeStyles: Record<string, { bg: string; color: string; border?: string }> = {
  NEW: { bg: "var(--color-accent-amber)", color: "#fff" },
  SALE: { bg: "var(--color-highlight)", color: "var(--color-text-primary)" },
  BESTSELLER: {
    bg: "transparent",
    color: "var(--color-accent-amber)",
    border: "1px solid var(--color-accent-amber)",
  },
};

export default function ProductCard({ product, showRating = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const defaultVariant = product.variants[0];
  const badge = product.badge ? badgeStyles[product.badge] : null;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div
        className="media-rounded relative overflow-hidden"
        style={{ aspectRatio: "4/5", backgroundColor: "var(--color-surface-muted)" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Image
          src={defaultVariant.images[0]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {badge && (
          <span
            className="type-badge absolute left-3 top-3 rounded-full px-2 py-1"
            style={{ backgroundColor: badge.bg, color: badge.color, border: badge.border }}
          >
            {product.badge}
          </span>
        )}
        <div
          className="absolute inset-x-0 bottom-4 flex justify-center overflow-hidden"
          style={{
            transform: hovered ? "translateY(0)" : "translateY(150%)",
            opacity: hovered ? 1 : 0,
            transition: "transform 0.3s ease, opacity 0.2s ease",
          }}
        >
          <div
            className="px-4 py-2 rounded-[10px] outline outline-1 outline-offset-[-1px] inline-flex justify-center items-center gap-1 bg-transparent"
            style={{
              outlineColor: "#575757",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              backgroundColor: "rgba(33, 33, 33, 0.36)",
              boxShadow:
                "rgba(255, 255, 255, 0.02) -3.35374px -3.35374px 167.687px 0px inset, rgba(0, 0, 0, 0.08) 0px 4px 22px 0px",
            }}
          >
            <div className="text-center justify-start text-white text-sm font-medium font-['DM_Sans'] leading-5">
              View Product
            </div>
            <div className="w-5 h-5 relative">
              <Image src="/ArrowRight.svg" alt="" fill className="object-contain" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {showRating && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < Math.round(product.rating) ? "var(--color-accent-amber)" : "none"}
                stroke={
                  i < Math.round(product.rating)
                    ? "var(--color-accent-amber)"
                    : "var(--color-text-disabled)"
                }
              />
            ))}
            <span className="text-xs ml-1" style={{ color: "var(--color-text-secondary)" }}>
              ({product.reviewCount})
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="type-title-sm" style={{ color: "var(--color-text-primary)" }}>
            {product.name}
          </span>
          <DirhamPrice amount={defaultVariant.price} compareAmount={defaultVariant.comparePrice} />
        </div>
        <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
          {product.variants.map((v) => v.color).join(", ")}
        </p>
      </div>
    </Link>
  );
}
