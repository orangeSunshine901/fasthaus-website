"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Tooltip } from "radix-ui";
import { getVariantImage, type Product, type ProductVariant } from "@/lib/data/products";
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
  const reducedMotion = useReducedMotion();
  const badge = product.badge ? badgeStyles[product.badge] : null;
  const productHref = `/product/${product.slug}?variant=${encodeURIComponent(selectedVariant.id)}`;

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const adding = useCartStore((s) => s.pending.includes(selectedVariant.id));

  useEffect(() => {
    capture(analyticsEvents.productImpression, {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      price: defaultVariant.price,
      currency: "AED",
    });
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
    const addingItem = addItem({
      id: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantColor: selectedVariant.color,
      price: selectedVariant.price,
      quantity: 1,
      image: getVariantImage(selectedVariant),
    });
    openDrawer();
    const added = await addingItem;
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
    }
  }

  return (
    <div className="relative">
      <Link
        href={productHref}
        className="group block"
        aria-label={`View ${product.name} in ${selectedVariant.color}`}
      >
        <div
          className="media-rounded relative overflow-hidden"
          style={{ aspectRatio: "4/5", backgroundColor: "var(--color-surface-muted)" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
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
              <picture>
                {selectedVariant.collectionMobileImage && (
                  <source
                    media="(max-width: 767px)"
                    srcSet={selectedVariant.collectionMobileImage}
                  />
                )}
                <Image
                  src={selectedVariant.collectionImage}
                  alt={`${product.name} in ${selectedVariant.color}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </picture>
            </motion.div>
          </AnimatePresence>
          {badge && (
            <span
              className="type-badge absolute left-3 top-3 rounded-full px-2 py-1"
              style={{ backgroundColor: badge.bg, color: badge.color, border: badge.border }}
            >
              {product.badge}
            </span>
          )}
          <div
            className={`absolute inset-x-0 bottom-[8px] flex translate-y-0 justify-center opacity-100 transition-[transform,opacity] duration-300 ease-out ${
              hovered ? "md:translate-y-0 md:opacity-100" : "md:translate-y-[150%] md:opacity-0"
            }`}
          >
            <div className="glass-surface glass-cta-surface relative inline-flex items-center justify-center gap-1 overflow-hidden rounded-full px-3 py-2">
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
        className="group absolute z-20 h-7 w-7"
        style={{ top: "16px", right: "16px" }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <rect
            x="0.5"
            y="0.5"
            width="27"
            height="27"
            rx="7.5"
            fill="none"
            className="stroke-[var(--color-accent-amber)] transition-colors duration-150 ease-out group-hover:fill-[var(--color-accent-amber)]"
          />
          <g clipPath={`url(#${clipId})`}>
            <path
              d="M18.548 15.1243C18.347 15.0688 18.1415 15.185 18.086 15.3845L17.9232 15.9695C17.8737 16.1345 17.7252 16.25 17.5625 16.25H11.975C11.8032 16.25 11.651 16.127 11.6135 15.9583L10.6745 11.75H12.125C12.332 11.75 12.5 11.582 12.5 11.375C12.5 11.168 12.332 11 12.125 11H10.5072L10.3692 10.3798C10.2582 9.8705 9.79775 9.5 9.275 9.5H8.375C8.168 9.5 8 9.668 8 9.875C8 10.082 8.168 10.25 8.375 10.25H9.275C9.4475 10.25 9.59975 10.3723 9.6365 10.5418L10.8815 16.1218C10.9947 16.6303 11.4545 17 11.975 17H17.5625C18.053 17 18.497 16.6655 18.6432 16.178L18.8082 15.5855C18.8645 15.386 18.7482 15.179 18.548 15.1243Z"
              className="fill-[var(--color-accent-amber)] transition-colors duration-150 ease-out group-hover:fill-[var(--color-bg)]"
            />
            <path
              d="M12.875 17.75C12.2547 17.75 11.75 18.2547 11.75 18.875C11.75 19.4953 12.2547 20 12.875 20C13.4953 20 14 19.4953 14 18.875C14 18.2547 13.4953 17.75 12.875 17.75ZM12.875 19.25C12.668 19.25 12.5 19.082 12.5 18.875C12.5 18.668 12.668 18.5 12.875 18.5C13.082 18.5 13.25 18.668 13.25 18.875C13.25 19.082 13.082 19.25 12.875 19.25Z"
              className="fill-[var(--color-accent-amber)] transition-colors duration-150 ease-out group-hover:fill-[var(--color-bg)]"
            />
            <path
              d="M16.625 17.75C16.0047 17.75 15.5 18.2547 15.5 18.875C15.5 19.4953 16.0047 20 16.625 20C17.2453 20 17.75 19.4953 17.75 18.875C17.75 18.2547 17.2453 17.75 16.625 17.75ZM16.625 19.25C16.418 19.25 16.25 19.082 16.25 18.875C16.25 18.668 16.418 18.5 16.625 18.5C16.832 18.5 17 18.668 17 18.875C17 19.082 16.832 19.25 16.625 19.25Z"
              className="fill-[var(--color-accent-amber)] transition-colors duration-150 ease-out group-hover:fill-[var(--color-bg)]"
            />
            <path
              d="M16.625 8C14.7643 8 13.25 9.51425 13.25 11.375C13.25 13.2358 14.7643 14.75 16.625 14.75C18.4857 14.75 20 13.2358 20 11.375C20 9.51425 18.4857 8 16.625 8ZM16.625 14C15.1775 14 14 12.8225 14 11.375C14 9.9275 15.1775 8.75 16.625 8.75C18.0725 8.75 19.25 9.9275 19.25 11.375C19.25 12.8225 18.0725 14 16.625 14Z"
              className="fill-[var(--color-accent-amber)] transition-colors duration-150 ease-out group-hover:fill-[var(--color-bg)]"
            />
            <path
              d="M18.125 11H17V9.875C17 9.668 16.832 9.5 16.625 9.5C16.418 9.5 16.25 9.668 16.25 9.875V11H15.125C14.918 11 14.75 11.168 14.75 11.375C14.75 11.582 14.918 11.75 15.125 11.75H16.25V12.875C16.25 13.082 16.418 13.25 16.625 13.25C16.832 13.25 17 13.082 17 12.875V11.75H18.125C18.332 11.75 18.5 11.582 18.5 11.375C18.5 11.168 18.332 11 18.125 11Z"
              className="fill-[var(--color-accent-amber)] transition-colors duration-150 ease-out group-hover:fill-[var(--color-bg)]"
            />
          </g>
          <defs>
            <clipPath id={clipId}>
              <rect width="28" height="28" rx="8" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </button>

      <div className="mt-3 space-y-1.5">
        <Link href={productHref} className="flex items-center justify-between">
          <span className="type-title-sm" style={{ color: "var(--color-text-primary)" }}>
            {product.name}
          </span>
          <DirhamPrice
            amount={selectedVariant.price}
            compareAmount={selectedVariant.comparePrice}
          />
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
