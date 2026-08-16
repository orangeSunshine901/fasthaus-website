"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Truck, CalendarCheck, ShieldCheck, Star } from "lucide-react";
import { Tooltip } from "radix-ui";
import type { Product, ProductVariant } from "@/lib/data/products";
import DirhamPrice from "@/components/ui/DirhamPrice";

type Props = {
  product: Product;
  selectedVariant: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  addOnsTotal?: number;
  busy?: boolean;
  error?: string | null;
  onAddToCart: () => unknown | Promise<unknown>;
  onBuyNow: () => unknown | Promise<unknown>;
};

export default function PurchaseRow({
  product,
  selectedVariant,
  onVariantChange,
  quantity,
  onQuantityChange,
  addOnsTotal = 0,
  busy = false,
  error,
  onAddToCart,
  onBuyNow,
}: Props) {
  const trustItems = [
    { icon: <Truck size={15} />, label: "Free shipping" },
    { icon: <CalendarCheck size={15} />, label: "14-day eligible returns" },
    { icon: <ShieldCheck size={15} />, label: "1-year warranty" },
    {
      icon: <Image src="/uae-flag-icon.svg" alt="" width={15} height={15} />,
      label: "Made in the UAE",
    },
  ];

  const filledStars = Math.round(product.rating);
  const lighting =
    product.features.find((feature) => /light|warmth/i.test(feature.label))?.label ??
    "Integrated lighting";
  const productDetails = [
    ["Dimensions", `Ø ${product.dimensions.widthCm} cm × H ${product.dimensions.heightCm} cm`],
    ["Lighting", lighting],
    ["Light source", product.specifications[1]?.lines.join(" · ") ?? "Included"],
    ["Power", product.specifications[0]?.lines.join(" · ") ?? "—"],
    ["Material", product.materials.join(" · ")],
  ];

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_356px] lg:gap-12">
      {/* Product info column */}
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-3">
          <h1
            className="text-[34px] font-extrabold leading-[1.03] tracking-[-0.03em] md:text-[46px]"
            style={{ color: "var(--color-text-primary)" }}
          >
            {product.name}
          </h1>
          <div className="flex items-center gap-3">
            {/* <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  strokeWidth={1.5}
                  fill={index < filledStars ? "var(--color-accent-amber)" : "none"}
                  style={{
                    color:
                      index < filledStars ? "var(--color-accent-amber)" : "var(--color-border)",
                  }}
                />
              ))}
            </div> */}
            {/* <span
              className="text-[14px] font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {product.rating.toFixed(1)} · {product.reviewCount} reviews
            </span> */}
          </div>
        </div>

        <p
          className="max-w-[62ch] text-[16.5px] leading-[1.6]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {product.description}
        </p>

        {/* <div className="mt-1 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {product.features.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2.5 rounded-[10px] px-3.5 py-3"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <Image src={feature.icon} alt="" width={18} height={18} className="shrink-0" />
              <span
                className="text-[14px] font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {feature.label}
              </span>
            </div>
          ))}
        </div> */}

        <div
          className="flex flex-col gap-5 border-t pt-6"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h3
            className="text-[20px] font-extrabold tracking-[-0.015em]"
            style={{ color: "var(--color-text-primary)" }}
          >
            Product details
          </h3>
          <div className="grid items-stretch gap-6 sm:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.15fr)] sm:gap-9">
            <div
              className="relative aspect-square overflow-hidden rounded-[14px]"
              style={{ backgroundColor: "var(--color-surface-muted)" }}
            >
              <Image
                src="/outline/hamrah-lamp-outline.png"
                alt={`${product.name} illustration`}
                fill
                sizes="(max-width: 639px) 100vw, 360px"
                className="object-cover"
              />
            </div>
            <div className="grid content-center grid-cols-[105px_minmax(0,1fr)] text-[14px] md:grid-cols-[125px_minmax(0,1fr)] md:text-[15px]">
              {productDetails.map(([label, value], index) => {
                const border = index < productDetails.length - 1 ? "border-b" : "";
                return (
                  <div key={label} className="contents">
                    <span
                      className={`${border} py-3 font-medium`}
                      style={{
                        color: "var(--color-text-secondary)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      className={`${border} py-3 font-semibold leading-[1.45]`}
                      style={{
                        color: "var(--color-text-primary)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Buy box */}
      <div
        className="flex flex-col gap-[18px] rounded-[18px] border bg-white p-6 md:p-7"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-baseline gap-2.5">
          <DirhamPrice variant="black" amount={selectedVariant.price} size="xl" />
          <span
            className="text-[13px] font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            incl. VAT
          </span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-x-7 gap-y-4 sm:justify-start">
          <div className="flex flex-col gap-2">
            <span
              className="text-[12.5px] font-bold uppercase tracking-[0.06em]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Lamp Color
            </span>
            <span className="text-[15px] font-bold" style={{ color: "var(--color-text-primary)" }}>
              {selectedVariant.color}
            </span>
            <Tooltip.Provider delayDuration={0}>
              <div className="flex gap-2.5">
                {product.variants.map((v) => (
                  <Tooltip.Root key={v.id}>
                    <Tooltip.Trigger asChild>
                      <button
                        type="button"
                        onClick={() => onVariantChange(v)}
                        className="h-9 w-9 rounded-full border-2 border-white transition-all md:h-[30px] md:w-[30px]"
                        style={{
                          backgroundColor: v.colorHex,
                          outline: `2px solid ${
                            selectedVariant.id === v.id
                              ? "var(--color-accent-amber)"
                              : "transparent"
                          }`,
                        }}
                        aria-label={v.color}
                      />
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        sideOffset={6}
                        className="z-50 rounded-md bg-[var(--color-text-primary)] px-2.5 py-1.5 text-xs font-medium text-white shadow-md"
                      >
                        {v.color}
                        <Tooltip.Arrow className="fill-[var(--color-text-primary)]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                ))}
              </div>
            </Tooltip.Provider>
          </div>
          <div className="flex flex-col gap-2">
            <span
              className="text-[12.5px] font-bold uppercase tracking-[0.06em]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Amount
            </span>
            <div
              className="flex items-center overflow-hidden rounded-[10px] border"
              style={{ borderColor: "var(--color-border)" }}
            >
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="grid h-11 w-11 place-items-center transition-colors hover:bg-[var(--color-surface)] disabled:opacity-40 md:h-[34px] md:w-[34px]"
                style={{ color: "var(--color-text-secondary)" }}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span
                className="w-9 text-center text-[15px] font-bold md:w-[34px]"
                style={{ color: "var(--color-text-primary)" }}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(Math.min(selectedVariant.stock, quantity + 1))}
                className="grid h-11 w-11 place-items-center transition-colors hover:bg-[var(--color-surface)] md:h-[34px] md:w-[34px]"
                style={{ color: "var(--color-text-secondary)" }}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onBuyNow}
            disabled={busy}
            className="flex h-[54px] items-center justify-center rounded-[12px] text-[16.5px] font-bold text-white transition-[filter] hover:brightness-95 disabled:cursor-wait disabled:opacity-60"
            style={{ backgroundColor: "var(--color-accent-amber)" }}
          >
            {busy ? "Preparing…" : "Buy now –"}&nbsp;
            <DirhamPrice
              amount={selectedVariant.price * quantity + addOnsTotal}
              size="sm"
              variant="white"
              className="font-bold text-white"
            />
          </button>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={busy}
            className="flex h-[54px] items-center justify-center gap-2 rounded-[12px] border-[1.5px] bg-white text-[16.5px] font-bold transition-colors hover:bg-[var(--color-surface)] disabled:cursor-wait disabled:opacity-60"
            style={{
              borderColor: "var(--color-text-primary)",
              color: "var(--color-text-primary)",
            }}
          >
            <ShoppingCart size={16} />
            {busy ? "Adding…" : "Add to cart"}
          </button>
          {error && (
            <p
              role="alert"
              className="text-[13px] font-medium"
              style={{ color: "var(--color-error)" }}
            >
              {error}
            </p>
          )}
        </div>

        <div
          className="grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          {trustItems.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {icon}
              <span className="text-[13px] font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col gap-1 rounded-[14px] p-5"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <span className="text-[14px] font-bold" style={{ color: "var(--color-text-primary)" }}>
            Estimated arrival
          </span>
          <strong
            className="text-[22px] leading-[1.35] tracking-[-0.02em]"
            style={{ color: "var(--color-text-primary)" }}
          >
            3–5 business days
          </strong>
          <span
            className="text-[13px] font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Made to order · Delivery included
          </span>
          <Link
            href="/shipping-returns"
            className="mt-2 self-start text-[13px] font-bold hover:underline"
            style={{ color: "var(--color-accent-amber)" }}
          >
            Shipping details →
          </Link>
        </div>
      </div>
    </div>
  );
}
