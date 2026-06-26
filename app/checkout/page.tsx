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
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
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
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    address2: "",
    emirate: "Dubai",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { items, addOns, total, clearCart } = useCartStore();
  const router = useRouter();

  if (items.length === 0) {
    return (
      /* Empty cart guard */
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p style={{ color: "var(--color-text-secondary)" }}>Your cart is empty.</p>
        <Link href="/collection" className="text-sm" style={{ color: "var(--color-accent-amber)" }}>
          Back to collection
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
        <div
          className="flex items-center gap-1 text-xs"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <span>🔒</span>
          <span>Secure checkout</span>
        </div>
      </header>

      <main className="container-page grid flex-1 grid-cols-1 gap-8 py-8 md:gap-10 md:py-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Step progress */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="type-badge flex h-6 w-6 items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      i <= step ? "var(--color-accent-amber)" : "var(--color-surface-muted)",
                    color: i <= step ? "#fff" : "var(--color-text-disabled)",
                  }}
                >
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span
                  className="type-badge hidden sm:block"
                  style={{
                    color: i === step ? "var(--color-text-primary)" : "var(--color-text-disabled)",
                  }}
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
              <h2 className="type-display-md mb-2" style={{ color: "var(--color-text-primary)" }}>
                Contact & Shipping
              </h2>
              <input
                required
                type="email"
                placeholder="Email address"
                value={shipping.email}
                onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                className="input-field"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  placeholder="First name"
                  value={shipping.firstName}
                  onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })}
                  className="input-field"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                  }}
                />
                <input
                  required
                  placeholder="Last name"
                  value={shipping.lastName}
                  onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                  className="input-field"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                  }}
                />
              </div>
              <input
                required
                placeholder="Phone number (+971…)"
                value={shipping.phone}
                onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                className="input-field"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              />
              <input
                required
                placeholder="Address line 1"
                value={shipping.address}
                onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                className="input-field"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              />
              <input
                placeholder="Address line 2 (optional)"
                value={shipping.address2}
                onChange={(e) => setShipping({ ...shipping, address2: e.target.value })}
                className="input-field"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={shipping.emirate}
                  onChange={(e) => setShipping({ ...shipping, emirate: e.target.value })}
                  className="input-field"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  {EMIRATES.map((em) => (
                    <option key={em}>{em}</option>
                  ))}
                </select>
                <input
                  placeholder="Postal code"
                  value={shipping.postalCode}
                  onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                  className="input-field"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary mt-2">
                Continue to Payment →
              </button>
            </form>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
              <h2 className="type-display-md mb-2" style={{ color: "var(--color-text-primary)" }}>
                Payment
              </h2>
              <div
                className="panel-surface p-4"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              >
                <p className="type-caption mb-4" style={{ color: "var(--color-text-primary)" }}>
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
                    <span
                      className="type-body-sm capitalize"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {method === "card"
                        ? "Credit / Debit Card"
                        : method === "apple-pay"
                          ? "Apple Pay"
                          : "Google Pay"}
                    </span>
                  </label>
                ))}
                {paymentMethod === "card" && (
                  <div
                    className="flex flex-col gap-3 mt-4 pt-4 border-t"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <input
                      placeholder="Card number"
                      defaultValue="4242 4242 4242 4242"
                      className="input-field"
                      style={{
                        borderColor: "var(--color-border)",
                        backgroundColor: "var(--color-bg)",
                      }}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="MM / YY"
                        defaultValue="12 / 28"
                        className="input-field"
                        style={{
                          borderColor: "var(--color-border)",
                          backgroundColor: "var(--color-bg)",
                        }}
                      />
                      <input
                        placeholder="CVC"
                        defaultValue="123"
                        className="input-field"
                        style={{
                          borderColor: "var(--color-border)",
                          backgroundColor: "var(--color-bg)",
                        }}
                      />
                    </div>
                    <p className="type-caption-sm" style={{ color: "var(--color-text-secondary)" }}>
                      This is a prototype — no real payment is processed.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="btn btn-outline flex-1"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                >
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Review Order →
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h2 className="type-display-md" style={{ color: "var(--color-text-primary)" }}>
                Review & Place Order
              </h2>
              <div
                className="panel-surface p-4"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              >
                <h3 className="type-title-md mb-3" style={{ color: "var(--color-text-primary)" }}>
                  Shipping to
                </h3>
                <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {shipping.firstName} {shipping.lastName}
                  <br />
                  {shipping.address}
                  {shipping.address2 ? `, ${shipping.address2}` : ""}
                  <br />
                  {shipping.emirate}, UAE {shipping.postalCode}
                  <br />
                  {shipping.phone}
                </p>
              </div>
              <div
                className="panel-surface p-4"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              >
                <h3 className="type-title-md mb-3" style={{ color: "var(--color-text-primary)" }}>
                  Payment
                </h3>
                <p
                  className="type-body-sm capitalize"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {paymentMethod === "card"
                    ? "Credit / Debit Card (•••• 4242)"
                    : paymentMethod.replace("-", " ")}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-outline flex-1"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                >
                  ← Back
                </button>
                <button onClick={handlePlaceOrder} className="btn btn-primary flex-1">
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div
          className="panel-surface h-fit p-6"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <h3 className="type-display-sm mb-4" style={{ color: "var(--color-text-primary)" }}>
            Order Summary
          </h3>
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 mb-3">
              <div
                className="relative flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)]"
                style={{ width: 52, height: 52, backgroundColor: "var(--color-surface-muted)" }}
              >
                <Image src={item.image} alt={item.productName} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="type-badge" style={{ color: "var(--color-text-primary)" }}>
                  {item.productName}
                </p>
                <p className="type-caption-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {item.variantColor} × {item.quantity}
                </p>
              </div>
              <DirhamPrice amount={item.price * item.quantity} size="sm" />
            </div>
          ))}
          {addOns.map((ao) => (
            <div key={ao.id} className="type-caption-sm mb-2 flex justify-between">
              <span style={{ color: "var(--color-text-secondary)" }}>Add-on: {ao.name}</span>
              <DirhamPrice amount={ao.price} size="sm" />
            </div>
          ))}
          <div
            className="border-t mt-4 pt-4 flex flex-col gap-2"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="type-body-sm flex justify-between">
              <span style={{ color: "var(--color-text-secondary)" }}>Shipping</span>
              <span className="font-medium" style={{ color: "var(--color-success)" }}>
                Free
              </span>
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
