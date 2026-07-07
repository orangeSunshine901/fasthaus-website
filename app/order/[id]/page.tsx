"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Clock, CreditCard, Printer, ShoppingBag, Star, Truck } from "lucide-react";
import DirhamPrice from "@/components/ui/DirhamPrice";

type StoredOrder = {
  id: string;
  items: {
    productName: string;
    variantColor: string;
    price: number;
    quantity: number;
    image: string;
    addOns?: { name: string; price: number; quantity: number }[];
  }[];
  addOns: { name: string; price: number; quantity?: number; productName?: string }[];
  subtotal: number;
  discountCode?: string;
  discount: number;
  total: number;
  shipping: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    emirate: string;
    poBox?: string;
  };
  payment: { method: "card" | "apple" | "tabby"; cardLast4?: string };
  deliveryWindow: string;
};

export default function OrderConfirmationPage() {
  const [order] = useState<StoredOrder | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem("fasthaus-last-order");
    return raw ? JSON.parse(raw) : null;
  });
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!order) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
        {/* Not found guard */}
        <div className="text-center py-24">
          <p style={{ color: "var(--color-text-secondary)" }}>Order not found.</p>
          <Link
            href="/"
            className="text-sm mt-4 block"
            style={{ color: "var(--color-accent-amber)" }}
          >
            Return home
          </Link>
        </div>
      </div>
    );
  }

  const standaloneAddOns = order.addOns.filter((ao) => !ao.productName);
  const itemCount =
    order.items.reduce((sum, item) => sum + item.quantity, 0) +
    standaloneAddOns.reduce((sum, ao) => sum + (ao.quantity ?? 1), 0);

  const paymentLabel =
    order.payment.method === "card"
      ? `Card  ····  ${order.payment.cardLast4 || "0000"}`
      : order.payment.method === "apple"
        ? "Apple Pay"
        : "Tabby — Pay in 4";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-[920px] px-5 py-14 md:px-8 md:py-20">
        {/* Hero */}
        <div className="mb-14 flex flex-col items-center gap-3.5 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ border: "2px solid var(--color-success)" }}
          >
            <Check size={26} strokeWidth={2.4} style={{ color: "var(--color-success)" }} />
          </span>
          <span
            className="type-caption-sm rounded-full border px-3.5 py-1"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
          >
            Order #{order.id}
          </span>
          <h1 className="type-display-xl mt-1" style={{ color: "var(--color-text-primary)" }}>
            Thank you for your order!
          </h1>
          <p className="type-body-md" style={{ color: "var(--color-text-secondary)" }}>
            We&apos;ve received your order and are getting it ready.
          </p>
          <div className="mt-2 flex gap-3">
            <Link href="/collection" className="btn btn-primary gap-2">
              <ShoppingBag size={16} />
              Continue shopping
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-outline gap-2"
              style={{ borderColor: "var(--color-text-primary)", color: "var(--color-text-primary)" }}
            >
              <Printer size={16} />
              Receipt
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-2">
          {/* LEFT: shipping + feedback */}
          <div className="flex flex-col gap-7">
            <div
              className="panel-surface flex flex-col gap-6 p-7"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
            >
              <h2 className="type-display-sm" style={{ color: "var(--color-text-primary)" }}>
                Shipping &amp; delivery
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <Truck size={17} style={{ color: "var(--color-text-secondary)" }} />
                    <span className="eyebrow" style={{ color: "var(--color-text-secondary)" }}>
                      Shipping address
                    </span>
                  </div>
                  <div className="type-body-sm flex flex-col gap-0.5" style={{ color: "var(--color-text-primary)" }}>
                    <span>{order.shipping.fullName}</span>
                    <span>{order.shipping.address}</span>
                    <span>{order.shipping.emirate}</span>
                    <span>United Arab Emirates</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <Clock size={17} style={{ color: "var(--color-text-secondary)" }} />
                    <span className="eyebrow" style={{ color: "var(--color-text-secondary)" }}>
                      Estimated delivery
                    </span>
                  </div>
                  <span className="type-body-sm" style={{ color: "var(--color-text-primary)" }}>
                    {order.deliveryWindow}
                  </span>
                  <span className="type-caption-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Made to order in 2–3 business days
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 border-t pt-5" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-2">
                  <CreditCard size={17} style={{ color: "var(--color-text-secondary)" }} />
                  <span className="eyebrow" style={{ color: "var(--color-text-secondary)" }}>
                    Payment method
                  </span>
                </div>
                <span className="type-body-sm" style={{ color: "var(--color-text-primary)" }}>
                  {paymentLabel}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="type-display-sm" style={{ color: "var(--color-text-primary)" }}>
                How was your experience?
              </h2>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="flex h-[46px] w-[46px] items-center justify-center rounded-[var(--radius-md)] border transition-colors"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
                    aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                  >
                    <Star
                      size={20}
                      fill={rating >= n ? "var(--color-highlight)" : "none"}
                      style={{ color: rating >= n ? "var(--color-highlight)" : "var(--color-text-disabled)" }}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what went well or what we could improve…"
                rows={4}
                className="input-field"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
              />
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="btn w-fit gap-2"
                style={{
                  backgroundColor: submitted ? "var(--color-success)" : "var(--color-text-primary)",
                  color: "#fff",
                  border: "none",
                }}
              >
                {submitted && <Check size={15} />}
                {submitted ? "Thanks for your feedback" : "Submit feedback"}
              </button>
            </div>
          </div>

          {/* RIGHT: order summary */}
          <aside
            className="panel-surface flex flex-col gap-5 p-7"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="type-display-sm" style={{ color: "var(--color-text-primary)" }}>
                Order summary
              </h2>
              <span
                className="type-caption-sm rounded-full border px-3 py-1"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex flex-col">
              {order.items.map((item, i) => (
                <div key={i} className="border-t py-3.5" style={{ borderColor: "var(--color-border)" }}>
                  <div className="flex items-center gap-4">
                    <div
                      className="media-rounded relative h-16 w-16 flex-shrink-0"
                      style={{ backgroundColor: "var(--color-surface-muted)" }}
                    >
                      <Image src={item.image} alt={item.productName} fill className="object-cover" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="type-title-sm" style={{ color: "var(--color-text-primary)" }}>
                        {item.productName}
                      </span>
                      <span className="type-caption-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {item.variantColor} · Qty {item.quantity}
                      </span>
                    </div>
                    <DirhamPrice amount={item.price * item.quantity} size="sm" />
                  </div>
                  {(item.addOns ?? []).map((ao, j) => (
                    <div key={j} className="mt-2.5 flex items-center gap-4 pl-20">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="type-caption-sm" style={{ color: "var(--color-text-primary)" }}>
                          {ao.name}
                        </span>
                        <span className="type-caption-sm" style={{ color: "var(--color-text-secondary)" }}>
                          Add-on · Qty {ao.quantity}
                        </span>
                      </div>
                      <DirhamPrice amount={ao.price * ao.quantity} size="sm" />
                    </div>
                  ))}
                </div>
              ))}
              {standaloneAddOns.map((ao, i) => (
                <div key={i} className="border-t py-3.5" style={{ borderColor: "var(--color-border)" }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="type-title-sm" style={{ color: "var(--color-text-primary)" }}>
                        {ao.name}
                      </span>
                      <span className="type-caption-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Add-on · Qty {ao.quantity ?? 1}
                      </span>
                    </div>
                    <DirhamPrice amount={ao.price * (ao.quantity ?? 1)} size="sm" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
              <div className="type-body-sm flex justify-between">
                <span style={{ color: "var(--color-text-secondary)" }}>Subtotal</span>
                <DirhamPrice amount={order.subtotal} />
              </div>
              {order.discount > 0 && (
                <div className="type-body-sm flex justify-between">
                  <span style={{ color: "var(--color-success)" }}>{order.discountCode ?? "Discount"}</span>
                  <span className="inline-flex items-center gap-0.5" style={{ color: "var(--color-success)" }}>
                    − <DirhamPrice amount={order.discount} />
                  </span>
                </div>
              )}
              <div className="type-body-sm flex justify-between">
                <span style={{ color: "var(--color-text-secondary)" }}>Shipping</span>
                <span style={{ color: "var(--color-success)" }}>Free</span>
              </div>
              <div className="flex items-baseline justify-between border-t pt-3.5" style={{ borderColor: "var(--color-border)" }}>
                <span className="type-title-sm" style={{ color: "var(--color-text-primary)" }}>
                  Total
                </span>
                <DirhamPrice amount={order.total} size="lg" />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[var(--radius-md)] p-4" style={{ backgroundColor: "var(--color-surface)" }}>
              <Clock size={18} style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
              <p className="type-caption-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                A confirmation email is on its way to{" "}
                <span style={{ color: "var(--color-text-primary)" }}>{order.shipping.email}</span>. We&apos;ll email
                you again when your order ships.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
