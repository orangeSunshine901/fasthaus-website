"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useEffect } from "react";
import ShopLayout from "@/components/layout/ShopLayout";
import DirhamPrice from "@/components/ui/DirhamPrice";
import { useCartStore } from "@/lib/store/cart";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";

export default function CartPage() {
  const {
    items,
    addOns,
    removeItem,
    updateQuantity,
    updateAddOnQuantity,
    removeAddOn,
    toggleAddOn,
    subtotal,
    total,
  } = useCartStore();
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const itemWord = itemCount === 1 ? "item" : "items";

  useEffect(() => {
    capture(analyticsEvents.cartViewed, {
      item_count: itemCount,
      cart_value: total(),
      currency: "AED",
    });
  }, [itemCount, total]);

  if (items.length === 0) {
    return (
      <ShopLayout>
        {/* Empty state */}
        <div className="container-page py-28 text-center md:py-48">
          <h1 className="type-display-xl mb-4" style={{ color: "var(--color-text-primary)" }}>
            Your Cart is empty.
          </h1>
          <p className="type-body-md mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Nothing here yet, let's fix that.
          </p>
          <Link href="/collection" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="container-page py-10 md:pb-10 md:pt-24">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
          {/* Line items */}
          <div className="flex min-w-0 flex-col">
            <div className="mb-7 flex items-baseline gap-3.5">
              <h1 className="type-display-xl mb-2" style={{ color: "var(--color-text-primary)" }}>
                Your Cart
              </h1>
              <p className="type-body-sm" style={{ color: "var(--color-text-disabled)" }}>
                {itemCount} {itemWord}
              </p>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 py-5 md:grid-cols-[96px_minmax(0,1fr)_auto_auto] md:items-center md:gap-5">
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="media-rounded relative h-20 w-20 md:h-24 md:w-24"
                    style={{ backgroundColor: "var(--color-surface-muted)" }}
                  >
                    <Image src={item.image} alt={item.productName} fill className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="type-title-sm" style={{ color: "var(--color-text-primary)" }}>
                      {item.productName}
                    </p>
                    <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Base color - {item.variantColor}
                    </p>
                    <button onClick={() => removeItem(item.id)} className="btn-text w-fit">
                      Remove
                    </button>
                  </div>
                  <div className="col-start-2 flex items-center justify-between gap-4 md:col-start-auto md:contents">
                    <div
                      className="flex w-fit items-center overflow-hidden rounded-[var(--radius-sm)] border"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="grid h-10 w-10 place-items-center disabled:opacity-40 md:h-[34px] md:w-[34px]"
                        style={{ color: "var(--color-text-secondary)" }}
                        aria-label={`Decrease ${item.productName} quantity`}
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        className="type-title-sm w-8 text-center md:w-[34px]"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="grid h-10 w-10 place-items-center md:h-[34px] md:w-[34px]"
                        style={{ color: "var(--color-text-secondary)" }}
                        aria-label={`Increase ${item.productName} quantity`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <DirhamPrice
                      amount={item.price * item.quantity}
                      className="md:w-[92px] md:justify-end"
                    />
                  </div>
                </div>

                {(item.addOns ?? []).map((ao) => (
                  <div
                    key={ao.id}
                    className="grid grid-cols-[56px_minmax(0,1fr)] gap-4 border-t py-4 pl-6 md:grid-cols-[72px_minmax(0,1fr)_auto_auto] md:items-center md:gap-5 md:pl-24"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div
                      className="media-rounded relative h-14 w-14"
                      style={{ backgroundColor: "var(--color-surface-muted)" }}
                    >
                      <Image src={ao.image} alt={ao.name} fill className="object-cover" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="type-title-sm" style={{ color: "var(--color-text-primary)" }}>
                        Add-on - {ao.name}
                      </p>
                      <p
                        className="type-caption-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        For {item.productName}
                      </p>
                      <button
                        onClick={() => removeAddOn(item.id, ao.id)}
                        className="btn-text w-fit"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="col-start-2 flex items-center justify-between gap-4 md:col-start-auto md:contents">
                      <div
                        className="flex w-fit items-center overflow-hidden rounded-[var(--radius-sm)] border"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <button
                          onClick={() => updateAddOnQuantity(item.id, ao.id, ao.quantity - 1)}
                          disabled={ao.quantity <= 1}
                          className="grid h-10 w-10 place-items-center disabled:opacity-40 md:h-[34px] md:w-[34px]"
                          style={{ color: "var(--color-text-secondary)" }}
                          aria-label={`Decrease ${ao.name} quantity`}
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          className="type-title-sm w-8 text-center md:w-[34px]"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {ao.quantity}
                        </span>
                        <button
                          onClick={() => updateAddOnQuantity(item.id, ao.id, ao.quantity + 1)}
                          disabled={ao.quantity >= item.quantity}
                          className="grid h-10 w-10 place-items-center disabled:opacity-40 md:h-[34px] md:w-[34px]"
                          style={{ color: "var(--color-text-secondary)" }}
                          aria-label={`Increase ${ao.name} quantity`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <DirhamPrice
                        amount={ao.price * ao.quantity}
                        className="md:w-[92px] md:justify-end"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Add-ons in cart */}
            {addOns.map((ao) => (
              <label
                key={ao.id}
                className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 border-t py-[18px] last:border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggleAddOn(ao)}
                  className="h-[18px] w-[18px] cursor-pointer accent-[var(--color-accent-amber)]"
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="type-title-sm" style={{ color: "var(--color-text-primary)" }}>
                    Add-on - {ao.name}
                  </span>
                  <span
                    className="type-caption-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Added to your order
                  </span>
                </div>
                <DirhamPrice amount={ao.price} className="w-[92px] justify-end" />
              </label>
            ))}

            <Link
              href="/collection"
              className="btn-text mt-6 inline-flex w-fit items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              Continue shopping
            </Link>
          </div>

          {/* Order Summary */}
          <aside
            className="panel-surface flex h-fit flex-col gap-5 p-5 md:p-7 lg:sticky lg:top-24"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <h2 className="type-display-sm" style={{ color: "var(--color-text-primary)" }}>
              Order Summary
            </h2>

            <div className="flex flex-col gap-3">
              <div className="type-body-sm flex justify-between">
                <span style={{ color: "var(--color-text-secondary)" }}>Subtotal</span>
                <DirhamPrice amount={subtotal()} />
              </div>
              <div className="type-body-sm flex justify-between">
                <span style={{ color: "var(--color-text-secondary)" }}>Shipping</span>
                <span className="font-medium" style={{ color: "var(--color-success)" }}>
                  Free
                </span>
              </div>
              <div
                className="flex justify-between border-t pt-3.5"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span className="type-title-sm" style={{ color: "var(--color-text-primary)" }}>
                  Total
                </span>
                <DirhamPrice amount={total()} size="lg" />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/checkout"
                onClick={() =>
                  capture(analyticsEvents.checkoutStarted, {
                    item_count: itemCount,
                    cart_value: total(),
                    currency: "AED",
                  })
                }
                className="btn btn-primary flex h-[52px] w-full items-center justify-center gap-1"
              >
                <span>Checkout -</span>
                <DirhamPrice amount={total()} variant="white" />
              </Link>
              <p
                className="type-caption-sm text-center"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Free shipping on all orders
              </p>
            </div>

            {/* Payment method icons */}
            <div
              className="flex flex-wrap justify-center gap-2 border-t pt-3.5"
              style={{ borderColor: "var(--color-border)" }}
            >
              {["VISA", "MASTERCARD", "G PAY", "APPLE PAY"].map((p) => (
                <span
                  key={p}
                  className="type-caption-sm rounded-md border px-2 py-1"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </ShopLayout>
  );
}
