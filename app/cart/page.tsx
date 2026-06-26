"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import ShopLayout from "@/components/layout/ShopLayout";
import DirhamPrice from "@/components/ui/DirhamPrice";
import { useCartStore } from "@/lib/store/cart";

export default function CartPage() {
  const { items, addOns, removeItem, updateQuantity, toggleAddOn, subtotal, total } =
    useCartStore();

  if (items.length === 0) {
    return (
      <ShopLayout>
        {/* Empty state */}
        <div className="container-page py-24 text-center">
          <h1 className="type-display-xl mb-4" style={{ color: "var(--color-text-primary)" }}>
            Your Cart
          </h1>
          <p className="type-body-md mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Your cart is empty.
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
      <div className="container-page py-8 md:py-10">
        <h1 className="type-display-xl mb-2" style={{ color: "var(--color-text-primary)" }}>
          Your Cart
        </h1>
        <p className="type-body-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
          {items.reduce((s, i) => s + i.quantity, 0)} items
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Line items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-4 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Link
                  href={`/product/${item.productSlug}`}
                  className="media-rounded relative h-[72px] w-[72px] flex-shrink-0 md:h-20 md:w-20"
                  style={{ backgroundColor: "var(--color-surface-muted)" }}
                >
                  <Image src={item.image} alt={item.productName} fill className="object-cover" />
                </Link>
                <div className="flex-1 flex flex-col gap-1">
                  <p className="type-caption" style={{ color: "var(--color-text-primary)" }}>
                    {item.productName}
                  </p>
                  <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Base Color: {item.variantColor}
                  </p>
                  <button onClick={() => removeItem(item.id)} className="btn-text w-fit">
                    Remove
                  </button>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <DirhamPrice amount={item.price * item.quantity} />
                  <div
                    className="flex items-center rounded-[var(--radius-sm)] border"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2 py-1 disabled:opacity-40"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="type-caption px-3">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add-ons in cart */}
            {addOns.map((ao) => (
              <div
                key={ao.id}
                className="flex gap-4 items-center pb-4 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked
                    onChange={() => toggleAddOn(ao)}
                    className="w-4 h-4 accent-[var(--color-accent-amber)]"
                  />
                  <span className="type-body-sm" style={{ color: "var(--color-text-primary)" }}>
                    Add-on: {ao.name}
                  </span>
                </div>
                <DirhamPrice amount={ao.price} className="ml-auto" />
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div
            className="panel-surface h-fit p-6"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <h2 className="type-display-sm mb-4" style={{ color: "var(--color-text-primary)" }}>
              Order Summary
            </h2>
            <div className="type-body-sm mb-2 flex justify-between">
              <span style={{ color: "var(--color-text-secondary)" }}>Subtotal</span>
              <DirhamPrice amount={subtotal()} />
            </div>
            <div className="type-body-sm mb-4 flex justify-between">
              <span style={{ color: "var(--color-text-secondary)" }}>Shipping</span>
              <span className="font-medium" style={{ color: "var(--color-success)" }}>
                Free
              </span>
            </div>
            <div
              className="flex justify-between font-semibold text-base pt-4 border-t mb-5"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span style={{ color: "var(--color-text-primary)" }}>Total</span>
              <DirhamPrice amount={total()} size="lg" />
            </div>
            <Link href="/checkout" className="btn btn-primary w-full">
              Checkout
            </Link>
            <p
              className="type-caption-sm mt-3 text-center"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Free shipping on all orders
            </p>
            {/* Payment method icons */}
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
              {["Visa", "Mastercard", "G Pay", "Apple Pay"].map((p) => (
                <span
                  key={p}
                  className="text-[10px] px-2 py-0.5 rounded border"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
