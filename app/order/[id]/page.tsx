"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import ShopLayout from "@/components/layout/ShopLayout";
import DirhamPrice from "@/components/ui/DirhamPrice";

type StoredOrder = {
  id: string;
  items: { productName: string; variantColor: string; price: number; quantity: number; image: string }[];
  addOns: { name: string; price: number }[];
  total: number;
  shipping: { firstName: string; lastName: string; email: string; emirate: string };
};

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<StoredOrder | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("fasthaus-last-order");
    if (raw) setOrder(JSON.parse(raw));
  }, []);

  if (!order) {
    return (
      <ShopLayout>
        <div className="text-center py-24">
          <p style={{ color: "var(--color-text-secondary)" }}>Order not found.</p>
          <Link href="/" className="text-sm mt-4 block" style={{ color: "var(--color-accent-amber)" }}>
            Return home
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="max-w-[640px] mx-auto px-6 py-16 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "var(--color-surface-muted)" }}
        >
          <ShieldCheck size={28} style={{ color: "var(--color-accent-amber)" }} />
        </div>

        <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Thank you! Your order is confirmed.
        </h1>
        <p className="text-sm mb-1" style={{ color: "var(--color-accent-amber)", fontWeight: 600 }}>
          Order #{order.id}
        </p>
        <p className="text-sm mb-10" style={{ color: "var(--color-text-secondary)" }}>
          A confirmation email with your receipt and order details is on its way to you.
        </p>

        {/* Status timeline */}
        <div className="flex items-start justify-center gap-4 mb-10">
          {[
            { label: "Production", sub: "2–3 business days", active: true },
            { label: "Shipping", sub: "3–7 business days", active: true },
            { label: "Delivered", sub: "We will keep you posted", active: false },
          ].map((s, i) => (
            <div key={s.label} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: s.active ? "var(--color-accent-amber)" : "var(--color-border)" }}
              />
              {i < 2 && <div className="absolute" />}
              <p className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>{s.label}</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Order summary card */}
        <div
          className="rounded-xl border p-5 text-left mb-8"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h2 className="font-semibold mb-4 text-sm" style={{ color: "var(--color-text-primary)" }}>
            Order Summary
          </h2>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm mb-2">
              <span style={{ color: "var(--color-text-primary)" }}>
                {item.productName} · {item.variantColor}
              </span>
              <DirhamPrice amount={item.price * item.quantity} size="sm" />
            </div>
          ))}
          {order.addOns.map((ao, i) => (
            <div key={i} className="flex justify-between text-sm mb-2">
              <span style={{ color: "var(--color-text-secondary)" }}>Add-on: {ao.name}</span>
              <DirhamPrice amount={ao.price} size="sm" />
            </div>
          ))}
          <div
            className="flex justify-between font-semibold pt-3 mt-2 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span style={{ color: "var(--color-text-primary)" }}>Total</span>
            <DirhamPrice amount={order.total} />
          </div>
        </div>

        <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Need help? <a href="mailto:support@fasthaus.ae" className="underline" style={{ color: "var(--color-text-secondary)" }}>support@fasthaus.ae</a>
        </p>

        <Link
          href="/shop"
          className="inline-block px-6 py-3 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: "var(--color-accent-amber)" }}
        >
          Continue shopping
        </Link>
      </div>
    </ShopLayout>
  );
}
