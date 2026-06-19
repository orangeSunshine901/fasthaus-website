"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import ShopLayout from "@/components/layout/ShopLayout";
import DirhamPrice from "@/components/ui/DirhamPrice";
import { useCartStore } from "@/lib/store/cart";

export default function CartPage() {
  const { items, addOns, removeItem, updateQuantity, toggleAddOn, subtotal, total } = useCartStore();

  if (items.length === 0) {
    return (
      <ShopLayout>
        <div className="max-w-[1280px] mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Your Cart</h1>
          <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>Your cart is empty.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: "var(--color-accent-amber)" }}
          >
            Continue Shopping
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Your Cart
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
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
                <Link href={`/product/${item.productSlug}`} className="relative flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 80, height: 80, backgroundColor: "var(--color-surface-muted)" }}>
                  <Image src={item.image} alt={item.productName} fill className="object-cover" />
                </Link>
                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{item.productName}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Base Color: {item.variantColor}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm w-fit"
                    style={{ color: "var(--color-accent-amber)" }}
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <DirhamPrice amount={item.price * item.quantity} />
                  <div
                    className="flex items-center rounded-lg border"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2 py-1 disabled:opacity-40"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
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
                  <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>Add-on: {ao.name}</span>
                </div>
                <DirhamPrice amount={ao.price} className="ml-auto" />
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div
            className="rounded-xl p-6 h-fit border"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
              Order Summary
            </h2>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "var(--color-text-secondary)" }}>Subtotal</span>
              <DirhamPrice amount={subtotal()} />
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span style={{ color: "var(--color-text-secondary)" }}>Shipping</span>
              <span className="font-medium" style={{ color: "var(--color-success)" }}>Free</span>
            </div>
            <div
              className="flex justify-between font-semibold text-base pt-4 border-t mb-5"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span style={{ color: "var(--color-text-primary)" }}>Total</span>
              <DirhamPrice amount={total()} size="lg" />
            </div>
            <Link
              href="/checkout"
              className="w-full block text-center h-12 leading-[48px] rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: "var(--color-accent-amber)" }}
            >
              Checkout
            </Link>
            <p className="text-xs text-center mt-3" style={{ color: "var(--color-text-secondary)" }}>
              Free shipping on all orders
            </p>
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
              {["Visa", "Mastercard", "G Pay", "Apple Pay"].map((p) => (
                <span
                  key={p}
                  className="text-[10px] px-2 py-0.5 rounded border"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
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
