"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "radix-ui";
import { getVariantMainImage, type Product, type ProductVariant } from "@/lib/data/products";
import DirhamPrice from "@/components/ui/DirhamPrice";
import { useCartStore } from "@/lib/store/cart";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";

type Props = {
  product: Product;
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

export default function ProductCard({ product }: Props) {
  const clipId = useId();
  const [hovered, setHovered] = useState(false);
  const defaultVariant = product.variants[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(defaultVariant);
  const badge = product.badge ? badgeStyles[product.badge] : null;
  const productHref = `/product/${product.slug}?variant=${encodeURIComponent(selectedVariant.id)}`;

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const adding = useCartStore((s) => s.pending.includes(selectedVariant.id));

  useEffect(() => {
    capture(analyticsEvents.productImpression, { product_id: product.id, product_name: product.name, category: product.category, price: defaultVariant.price, currency: "AED" });
  }, [defaultVariant.price, product.category, product.id, product.name]);

  function handleVariantSelect(variant: ProductVariant) {
    if (variant.id === selectedVariant.id) return;
    setSelectedVariant(variant);
    capture(analyticsEvents.productOptionSelected, {
      product_id: product.id,
      option_type: "color",
      option_value: variant.color,
      price: variant.price,
      currency: "AED",
    });
  }

  async function handleAddToCart() {
    const added = await addItem({
      id: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantColor: selectedVariant.color,
      price: selectedVariant.price,
      quantity: 1,
      image: getVariantMainImage(selectedVariant),
    });
    if (added) {
      capture(analyticsEvents.productAddedToCart, {
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        price: selectedVariant.price,
        currency: "AED",
        quantity: 1,
        cart_value: selectedVariant.price,
      });
      openDrawer();
    }
  }

  return (
    <div className="relative">
      <Link href={productHref} className="group block">
        <div
          className="media-rounded relative overflow-hidden"
          style={{ aspectRatio: "4/5", backgroundColor: "var(--color-surface-muted)" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Image
            src={selectedVariant.collectionImage}
            alt={`${product.name} in ${selectedVariant.color}`}
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
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={adding}
        aria-label={`Add ${product.name} to cart`}
        className="group absolute z-20 h-8 w-8 disabled:cursor-wait disabled:opacity-60"
        style={{ top: "16px", right: "16px" }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <g clipPath={`url(#${clipId})`}>
            <rect
              width="32"
              height="32"
              rx="8"
              className="fill-[var(--color-accent-amber)] transition-colors duration-150 ease-out group-hover:fill-[var(--color-accent-amber-hover)]"
            />
            <path
              d="M25.096 18.2485C24.694 18.1375 24.283 18.37 24.172 18.769L23.8465 19.939C23.7475 20.269 23.4505 20.5 23.125 20.5H11.95C11.6065 20.5 11.302 20.254 11.227 19.9165L9.349 11.5H12.25C12.664 11.5 13 11.164 13 10.75C13 10.336 12.664 10 12.25 10H9.0145L8.7385 8.7595C8.5165 7.741 7.5955 7 6.55 7H4.75C4.336 7 4 7.336 4 7.75C4 8.164 4.336 8.5 4.75 8.5H6.55C6.895 8.5 7.1995 8.7445 7.273 9.0835L9.763 20.2435C9.9895 21.2605 10.909 22 11.95 22H23.125C24.106 22 24.994 21.331 25.2865 20.356L25.6165 19.171C25.729 18.772 25.4965 18.358 25.096 18.2485Z"
              fill="var(--color-surface)"
            />
            <path
              d="M13.75 23.5C12.5095 23.5 11.5 24.5095 11.5 25.75C11.5 26.9905 12.5095 28 13.75 28C14.9905 28 16 26.9905 16 25.75C16 24.5095 14.9905 23.5 13.75 23.5ZM13.75 26.5C13.336 26.5 13 26.164 13 25.75C13 25.336 13.336 25 13.75 25C14.164 25 14.5 25.336 14.5 25.75C14.5 26.164 14.164 26.5 13.75 26.5Z"
              fill="var(--color-surface)"
            />
            <path
              d="M21.25 23.5C20.0095 23.5 19 24.5095 19 25.75C19 26.9905 20.0095 28 21.25 28C22.4905 28 23.5 26.9905 23.5 25.75C23.5 24.5095 22.4905 23.5 21.25 23.5ZM21.25 26.5C20.836 26.5 20.5 26.164 20.5 25.75C20.5 25.336 20.836 25 21.25 25C21.664 25 22 25.336 22 25.75C22 26.164 21.664 26.5 21.25 26.5Z"
              fill="var(--color-surface)"
            />
            <path
              d="M21.25 4C17.5285 4 14.5 7.0285 14.5 10.75C14.5 14.4715 17.5285 17.5 21.25 17.5C24.9715 17.5 28 14.4715 28 10.75C28 7.0285 24.9715 4 21.25 4ZM21.25 16C18.355 16 16 13.645 16 10.75C16 7.855 18.355 5.5 21.25 5.5C24.145 5.5 26.5 7.855 26.5 10.75C26.5 13.645 24.145 16 21.25 16Z"
              fill="var(--color-surface)"
            />
            <path
              d="M24.25 10H22V7.75C22 7.336 21.664 7 21.25 7C20.836 7 20.5 7.336 20.5 7.75V10H18.25C17.836 10 17.5 10.336 17.5 10.75C17.5 11.164 17.836 11.5 18.25 11.5H20.5V13.75C20.5 14.164 20.836 14.5 21.25 14.5C21.664 14.5 22 14.164 22 13.75V11.5H24.25C24.664 11.5 25 11.164 25 10.75C25 10.336 24.664 10 24.25 10Z"
              fill="var(--color-surface)"
            />
          </g>
          <defs>
            <clipPath id={clipId}>
              <rect width="32" height="32" rx="8" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </button>

      <div className="mt-3 space-y-1.5">
        <Link href={productHref} className="flex items-center justify-between">
          <span className="type-title-sm" style={{ color: "var(--color-text-primary)" }}>
            {product.name}
          </span>
          <DirhamPrice amount={selectedVariant.price} compareAmount={selectedVariant.comparePrice} />
        </Link>

        <Tooltip.Provider delayDuration={0}>
          <div className="flex items-center gap-2 pt-0.5">
            {product.variants.map((variant) => (
              <Tooltip.Root key={variant.id}>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    onClick={() => handleVariantSelect(variant)}
                    className={`h-4 w-4 rounded-full border transition-transform duration-200 ${
                      selectedVariant.id === variant.id ? "" : "hover:scale-[1.2]"
                    }`}
                    style={{
                      backgroundColor: variant.colorHex,
                      borderColor: "var(--color-border)",
                      outline:
                        selectedVariant.id === variant.id
                          ? "2px solid var(--color-accent-amber)"
                          : "none",
                      outlineOffset: "2px",
                    }}
                    aria-label={`View ${product.name} in ${variant.color}`}
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
      </div>
    </div>
  );
}
