"use client";

import Link from "next/link";
import type { Product } from "@/lib/data/products";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const TABS = ["Materials", "Shipping & Returns", "Warranty"] as const;
export type ProductTab = (typeof TABS)[number];

export default function ProductTabs({
  product,
  activeTab,
  onTabChange,
}: {
  product: Product;
  activeTab: ProductTab;
  onTabChange: (tab: ProductTab) => void;
}) {
  return (
    <section>
      {/* Tab bar */}
      <ScrollArea
        className="-mx-5 border-b px-5 md:mx-0 md:px-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex w-max gap-1 pb-2 md:w-full">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`whitespace-nowrap px-[18px] py-3.5 text-[15px] transition-colors hover:text-[var(--color-text-primary)] md:py-3 ${
                  active ? "font-bold" : "font-semibold"
                }`}
                style={{
                  color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  boxShadow: active ? "inset 0 -2px 0 var(--color-accent-amber)" : "none",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Tab content */}
      <div className="px-1 pt-7">
        {activeTab === "Materials" && (
          <div className="flex max-w-[720px] flex-col gap-3">
            {product.materialsDescription.map((description) => (
              <p
                key={description}
                className="text-[15px] font-normal leading-[1.65]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {description}
              </p>
            ))}
          </div>
        )}

        {activeTab === "Shipping & Returns" && (
          <div className="flex max-w-[720px] flex-col gap-3">
            <h3 className="text-[18px] font-bold">Made to order and tracked</h3>
            <p className="text-[15px] leading-[1.65] text-[var(--color-text-secondary)]">
              Production begins after payment and tracking details are emailed once your order is
              dispatched. Eligible products can be returned within 14 days after reasonable
              inspection if kept in their original condition. Change-of-mind return shipping is the
              customer&apos;s responsibility, and approved refunds are processed within 5–10
              business days after inspection.
            </p>
            <div className="flex flex-wrap gap-5 pt-1 text-[14px] font-bold text-[var(--color-accent-amber)]">
              <Link href="/shipping-returns" className="hover:underline">
                Shipping policy →
              </Link>
              <Link href="/legal/refunds" className="hover:underline">
                Refund &amp; Return policy →
              </Link>
            </div>
          </div>
        )}

        {activeTab === "Warranty" && (
          <div className="flex max-w-[720px] flex-col gap-3">
            <h3 className="text-[18px] font-bold">Coverage included</h3>
            <p className="text-[15px] leading-[1.65] text-[var(--color-text-secondary)]">
              Fasthaus products include a 12-month warranty on supplied electrical components and a
              30-day workmanship warranty on printed components. Contact us with your order number
              to start a claim.
            </p>
            <Link
              href="/warranty"
              className="self-start pt-1 text-[14px] font-bold text-[var(--color-accent-amber)] hover:underline"
            >
              Warranty policy →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
