"use client";

import Link from "next/link";
import { Tabs } from "radix-ui";
import type { Product } from "@/lib/data/products";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const TABS = { materials: "Materials", shipping: "Shipping & Returns", warranty: "Warranty" } as const;
export type ProductTab = keyof typeof TABS;

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
    <Tabs.Root value={activeTab} onValueChange={(tab) => onTabChange(tab as ProductTab)}>
      {/* Tab bar */}
      <ScrollArea
        className="-mx-5 border-b px-5 md:mx-0 md:px-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <Tabs.List aria-label="Product information" className="flex w-max gap-1 pb-2 md:w-full">
          {Object.entries(TABS).map(([tab, label]) => {
            const active = activeTab === tab;
            return (
              <Tabs.Trigger
                key={tab}
                value={tab}
                className={`whitespace-nowrap px-[18px] py-3.5 text-[15px] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-text-primary)] hover:text-[var(--color-text-primary)] md:py-3 ${
                  active ? "font-bold" : "font-semibold"
                }`}
                style={{
                  color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  boxShadow: active ? "inset 0 -2px 0 var(--color-accent-amber)" : "none",
                }}
              >
                {label}
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Tab content */}
      <div className="px-1 pt-7">
        <Tabs.Content value="materials"
          className="flex max-w-[720px] flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)]"
        >
          {product.materialsDescription.map((description) => (
            <p
              key={description}
              className="text-[15px] font-normal leading-[1.65]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {description}
            </p>
          ))}
        </Tabs.Content>

        <Tabs.Content value="shipping"
          className="flex max-w-[720px] flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)]"
        >
          <h3 className="text-[18px] font-bold">Made to order and tracked</h3>
          <p className="text-[15px] leading-[1.65] text-[var(--color-text-secondary)]">
            Production begins after payment and tracking details are emailed once your order is
            dispatched. Eligible products can be returned within 14 days after reasonable
            inspection if kept in their original condition. Change-of-mind return shipping is the
            customer&apos;s responsibility, and approved refunds are processed within 5–10
            business days after inspection.
          </p>
          <div className="flex flex-wrap gap-5 pt-1 text-[14px] font-bold text-[var(--color-text-primary)]">
            <Link href="/legal/shipping" className="underline underline-offset-4">
              Shipping policy →
            </Link>
            <Link href="/legal/refunds" className="underline underline-offset-4">
              Refund &amp; Return policy →
            </Link>
          </div>
        </Tabs.Content>

        <Tabs.Content value="warranty"
          className="flex max-w-[720px] flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text-primary)]"
        >
          <h3 className="text-[18px] font-bold">Coverage included</h3>
          <p className="text-[15px] leading-[1.65] text-[var(--color-text-secondary)]">
            Fasthaus products include a 12-month warranty on supplied electrical components and a
            30-day workmanship warranty on printed components. Contact us with your order number
            to start a claim.
          </p>
          <Link
            href="/legal/warranty"
            className="self-start pt-1 text-[14px] font-bold text-[var(--color-text-primary)] underline underline-offset-4"
          >
            Warranty policy →
          </Link>
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
