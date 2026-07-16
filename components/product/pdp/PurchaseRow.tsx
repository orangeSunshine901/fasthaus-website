"use client";

import Image from "next/image";
import { Star, ShoppingCart, Minus, Plus, Truck, CalendarCheck, ShieldCheck } from "lucide-react";
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
    { icon: <CalendarCheck size={15} />, label: "30-day returns" },
    { icon: <ShieldCheck size={15} />, label: "1-year warranty" },
    {
      icon: <Image src="/uae-flag-icon.svg" alt="" width={15} height={15} />,
      label: "Made in the UAE",
    },
  ];

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_356px] lg:gap-12">
      {/* Product info column */}
      <div className="flex min-w-0 flex-col gap-5">
        <div>
          <h1
            className="mb-2.5 text-[32px] font-extrabold leading-[1.05] tracking-[-0.025em] md:text-[40px]"
            style={{ color: "var(--color-text-primary)" }}
          >
            {product.name}
          </h1>
          {/* <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(product.rating) ? "var(--color-accent-amber)" : "none"}
                  stroke={
                    i < Math.round(product.rating)
                      ? "var(--color-accent-amber)"
                      : "var(--color-text-disabled)"
                  }
                />
              ))}
            </div>
            <span
              className="text-[14px] font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {product.rating} · <span className="underline">{product.reviewCount} reviews</span>
            </span>
          </div> */}
        </div>

        <p
          className="text-[16px] leading-[1.65] max-w-[62ch]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {product.description}
        </p>

        <div className="mt-1 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
        </div>
      </div>

      {/* Buy box */}
      <div
        className="flex flex-col gap-[18px] rounded-[16px] border bg-white p-5 md:p-6"
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
            className="flex h-[50px] items-center justify-center rounded-[12px] text-[16px] font-bold text-white transition-[filter] hover:brightness-95 disabled:cursor-wait disabled:opacity-60"
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
            className="flex h-[50px] items-center justify-center gap-2 rounded-[12px] border-[1.5px] bg-white text-[16px] font-bold transition-colors hover:bg-[var(--color-surface)] disabled:cursor-wait disabled:opacity-60"
            style={{
              borderColor: "var(--color-text-primary)",
              color: "var(--color-text-primary)",
            }}
          >
            <ShoppingCart size={16} />
            {busy ? "Adding…" : "Add to cart"}
          </button>
          {error && <p role="alert" className="text-[13px] font-medium" style={{ color: "var(--color-error)" }}>{error}</p>}
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
      </div>
    </div>
  );
}
