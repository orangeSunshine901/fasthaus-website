"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import DirhamPrice from "@/components/ui/DirhamPrice";
import { useCartStore } from "@/lib/store/cart";
import AnnouncementBar from "@/components/layout/AnnouncementBar";

const EMIRATES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
  "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
];

const STEPS = ["Contact & Shipping", "Payment", "Review & Place Order"] as const;

type ShippingForm = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  address2: string;
  emirate: string;
  postalCode: string;
};

function generateOrderId(): string {
  return "FH-" + Math.floor(10000 + Math.random() * 90000);
}

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState<ShippingForm>({
    email: "", firstName: "", lastName: "", phone: "",
    address: "", address2: "", emirate: "Dubai", postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { items, addOns, total, clearCart } = useCartStore();
  const router = useRouter();

  if (items.length === 0) {
    return (
      /* Empty cart guard */
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p style={{ color: "var(--color-text-secondary)" }}>Your cart is empty.</p>
        <Link href="/shop" className="text-sm" style={{ color: "var(--color-accent-amber)" }}>
          Back to shop
        </Link>
      </div>
    );
  }

  function handleShippingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep(1);
  }

  function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  function handlePlaceOrder() {
    const orderId = generateOrderId();
    const order = {
      id: orderId,
      items,
      addOns,
      shipping,
      total: total(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("fasthaus-last-order", JSON.stringify(order));
    clearCart();
    router.push(`/order/${orderId}`);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <AnnouncementBar />
      {/* Checkout header — minimal nav */}
      {/* Checkout header — minimal nav with logo + secure badge */}
      <header
        className="border-b px-6 h-16 flex items-center justify-between"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
      >
        <Link href="/">
          <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={110} height={26} />
        </Link>
        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
          <span>🔒</span>
          <span>Secure checkout</span>
        </div>
      </header>

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* Step progress */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: i <= step ? "var(--color-accent-amber)" : "var(--color-surface-muted)",
                    color: i <= step ? "#fff" : "var(--color-text-disabled)",
                  }}
                >
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span
                  className="text-xs font-medium hidden sm:block"
                  style={{ color: i === step ? "var(--color-text-primary)" : "var(--color-text-disabled)" }}
                >
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="w-8 h-px" style={{ backgroundColor: "var(--color-border)" }} />
                )}
              </div>
            ))}
          </div>

          {/* Step 0: Contact & Shipping */}
          {step === 0 && (
            <form onSubmit={handleShippingSubmit} className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                Contact & Shipping
              </h2>
              <input
                required type="email" placeholder="Email address"
                value={shipping.email} onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                className="h-12 px-4 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)]"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required placeholder="First name" value={shipping.firstName}
                  onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })}
                  className="h-12 px-4 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)]"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                />
                <input
                  required placeholder="Last name" value={shipping.lastName}
                  onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                  className="h-12 px-4 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)]"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                />
              </div>
              <input
                required placeholder="Phone number (+971…)" value={shipping.phone}
                onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                className="h-12 px-4 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)]"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              />
              <input
                required placeholder="Address line 1" value={shipping.address}
                onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                className="h-12 px-4 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)]"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              />
              <input
                placeholder="Address line 2 (optional)" value={shipping.address2}
                onChange={(e) => setShipping({ ...shipping, address2: e.target.value })}
                className="h-12 px-4 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)]"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={shipping.emirate}
                  onChange={(e) => setShipping({ ...shipping, emirate: e.target.value })}
                  className="h-12 px-4 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)]"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                >
                  {EMIRATES.map((em) => <option key={em}>{em}</option>)}
                </select>
                <input
                  placeholder="Postal code" value={shipping.postalCode}
                  onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                  className="h-12 px-4 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)]"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                />
              </div>
              <button
                type="submit"
                className="mt-2 h-12 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: "var(--color-accent-amber)" }}
              >
                Continue to Payment →
              </button>
            </form>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                Payment
              </h2>
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <p className="text-sm font-medium mb-4" style={{ color: "var(--color-text-primary)" }}>
                  Select payment method
                </p>
                {["card", "apple-pay", "google-pay"].map((method) => (
                  <label key={method} className="flex items-center gap-3 mb-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-[var(--color-accent-amber)]"
                    />
                    <span className="text-sm capitalize" style={{ color: "var(--color-text-primary)" }}>
                      {method === "card" ? "Credit / Debit Card" : method === "apple-pay" ? "Apple Pay" : "Google Pay"}
                    </span>
                  </label>
                ))}
                {paymentMethod === "card" && (
                  <div className="flex flex-col gap-3 mt-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                    <input
                      placeholder="Card number" defaultValue="4242 4242 4242 4242"
                      className="h-12 px-4 rounded-lg border text-sm outline-none"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="MM / YY" defaultValue="12 / 28"
                        className="h-12 px-4 rounded-lg border text-sm outline-none"
                        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
                      />
                      <input
                        placeholder="CVC" defaultValue="123"
                        className="h-12 px-4 rounded-lg border text-sm outline-none"
                        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
                      />
                    </div>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                      This is a prototype — no real payment is processed.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex-1 h-12 rounded-full border text-sm font-medium"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: "var(--color-accent-amber)" }}
                >
                  Review Order →
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Review & Place Order
              </h2>
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
                  Shipping to
                </h3>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {shipping.firstName} {shipping.lastName}<br />
                  {shipping.address}{shipping.address2 ? `, ${shipping.address2}` : ""}<br />
                  {shipping.emirate}, UAE {shipping.postalCode}<br />
                  {shipping.phone}
                </p>
              </div>
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
                  Payment
                </h3>
                <p className="text-sm capitalize" style={{ color: "var(--color-text-secondary)" }}>
                  {paymentMethod === "card" ? "Credit / Debit Card (•••• 4242)" : paymentMethod.replace("-", " ")}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 rounded-full border text-sm font-medium"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                >
                  ← Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 h-12 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: "var(--color-accent-amber)" }}
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div
          className="rounded-xl border p-6 h-fit"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Order Summary</h3>
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 mb-3">
              <div className="relative flex-shrink-0 rounded-lg overflow-hidden" style={{ width: 52, height: 52, backgroundColor: "var(--color-surface-muted)" }}>
                <Image src={item.image} alt={item.productName} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>{item.productName}</p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{item.variantColor} × {item.quantity}</p>
              </div>
              <DirhamPrice amount={item.price * item.quantity} size="sm" />
            </div>
          ))}
          {addOns.map((ao) => (
            <div key={ao.id} className="flex justify-between text-xs mb-2">
              <span style={{ color: "var(--color-text-secondary)" }}>Add-on: {ao.name}</span>
              <DirhamPrice amount={ao.price} size="sm" />
            </div>
          ))}
          <div className="border-t mt-4 pt-4 flex flex-col gap-2" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--color-text-secondary)" }}>Shipping</span>
              <span className="font-medium" style={{ color: "var(--color-success)" }}>Free</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span style={{ color: "var(--color-text-primary)" }}>Total</span>
              <DirhamPrice amount={total()} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
