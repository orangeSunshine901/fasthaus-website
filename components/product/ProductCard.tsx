"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/lib/data/products";
import DirhamPrice from "@/components/ui/DirhamPrice";
import { useCartStore } from "@/lib/store/cart";

type Props = {
  product: Product;
  showRating?: boolean;
};

const badgeStyles: Record<string, { bg: string; color: string; border?: string }> = {
  NEW: { bg: "var(--color-accent-amber)", color: "#fff" },
  SALE: { bg: "var(--color-highlight)", color: "var(--color-text-primary)" },
  BESTSELLER: { bg: "transparent", color: "var(--color-accent-amber)", border: "1px solid var(--color-accent-amber)" },
};

export default function ProductCard({ product, showRating = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const defaultVariant = product.variants[0];

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      id: defaultVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantColor: defaultVariant.color,
      price: defaultVariant.price,
      quantity: 1,
      image: defaultVariant.images[0],
    });
  }

  const badge = product.badge ? badgeStyles[product.badge] : null;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div
        className="relative rounded-xl overflow-hidden"
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
            className="absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: badge.bg, color: badge.color, border: badge.border }}
          >
            {product.badge}
          </span>
        )}
        {/* Quick add overlay */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-3 text-sm font-medium text-white transition-all duration-150"
          style={{
            backgroundColor: "var(--color-accent-amber)",
            transform: hovered ? "translateY(0)" : "translateY(100%)",
          }}
          aria-label={`Quick add ${product.name} to cart`}
        >
          <ShoppingCart size={14} />
          quick add
        </button>
      </div>

      <div className="mt-3 space-y-1">
        {showRating && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < Math.round(product.rating) ? "var(--color-accent-amber)" : "none"}
                stroke={i < Math.round(product.rating) ? "var(--color-accent-amber)" : "var(--color-text-disabled)"}
              />
            ))}
            <span className="text-xs ml-1" style={{ color: "var(--color-text-secondary)" }}>
              ({product.reviewCount})
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-base font-medium" style={{ color: "var(--color-text-primary)" }}>
            {product.name}
          </span>
          <DirhamPrice
            amount={defaultVariant.price}
            compareAmount={defaultVariant.comparePrice}
          />
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {product.variants.map((v) => v.color).join(", ")}
        </p>
      </div>
    </Link>
  );
}
