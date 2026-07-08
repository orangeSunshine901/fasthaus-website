"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Clock, Truck, CalendarCheck, ThumbsUp, Info, ShieldCheck } from "lucide-react";
import type { Product } from "@/lib/data/products";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const TABS = ["Product Info", "Specifications", "Materials", "Shipping & Returns"] as const;
export type ProductTab = (typeof TABS)[number];

const SHIPPING_RETURNS: { icon: ReactNode; title: string; description: string }[][] = [
  [
    {
      icon: <Clock size={18} />,
      title: "2–3 Day Dispatch",
      description:
        "Standard production window is 2–3 days. Limited items dispatched within 5 days.",
    },
    {
      icon: <Truck size={18} />,
      title: "Shipping",
      description: "We ship across the UAE via tracked courier.",
    },
    {
      icon: <CalendarCheck size={18} />,
      title: "Fast Tracking",
      description: "Within 1–2 business days.",
    },
  ],
  [
    {
      icon: <ThumbsUp size={18} />,
      title: "Hassle-Free Returns",
      description:
        "7-day return policy. Contact support with your order number to begin the process.",
    },
    {
      icon: <Info size={18} />,
      title: "Transit Protection",
      description:
        "Report damage within 48 hours with photos for a complimentary express replacement.",
    },
    {
      icon: <ShieldCheck size={18} />,
      title: "Warranty Included",
      description:
        "Includes a 1-year manufacturer warranty covering electrical components and craftsmanship.",
    },
  ],
];

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
        {activeTab === "Product Info" && (
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex flex-col gap-6">
              <div>
                <h3
                  className="mb-2.5 text-[18px] font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Design Story
                </h3>
                <p
                  className="max-w-[62ch] text-[15.5px] leading-[1.7]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {product.designStory}
                </p>
              </div>
              <div>
                <h3
                  className="text-[18px] font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Perfect For
                </h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {product.perfectFor.map((use) => (
                    <div
                      key={use.label}
                      className="flex flex-col items-center gap-3 px-3 py-5 md:gap-5 md:px-4 md:py-8"
                    >
                      <Image src={use.icon} alt="" width={36} height={36} className="h-9 w-auto" />
                      <span
                        className="text-center text-[15px] font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {use.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden gap-3 lg:flex">
              <div
                className="relative w-[200px] overflow-hidden rounded-[14px]"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                <Image
                  src={product.dimensions.image}
                  alt={`${product.name} dimensions`}
                  fill
                  sizes="200px"
                  className="object-contain"
                />
              </div>
              <div
                className="relative w-[200px] overflow-hidden rounded-[14px]"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                <Image
                  src="/lamp-shade-blueprint.png"
                  alt={`${product.name} shade blueprint`}
                  fill
                  sizes="200px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Specifications" && (
          <div className="max-w-[560px]">
            {product.specifications.map((spec, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-3"
                style={
                  i < product.specifications.length - 1
                    ? { borderBottom: "1px solid var(--color-border)" }
                    : undefined
                }
              >
                <Image src={spec.icon} alt="" width={36} height={36} className="shrink-0" />
                <div className="text-[15px]" style={{ color: "var(--color-text-primary)" }}>
                  {spec.lines.map((line) => (
                    <p key={line} className="font-regular leading-[1.6]">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Materials" && (
          <div className="flex max-w-[560px] flex-col gap-2">
            {product.materials.map((material) => (
              <span
                key={material}
                className="flex items-center gap-2.5 text-[15px] font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: "var(--color-accent-amber)" }}
                />
                {material}
              </span>
            ))}
          </div>
        )}

        {activeTab === "Shipping & Returns" && (
          <div className="flex flex-col gap-4 md:flex-row md:gap-16">
            {SHIPPING_RETURNS.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-1 flex-col">
                {column.map((block, blockIndex) => (
                  <div
                    key={block.title}
                    className="flex flex-col gap-2 py-4"
                    style={
                      blockIndex > 0
                        ? { borderTop: "1px solid var(--color-border)" }
                        : { paddingTop: 0 }
                    }
                  >
                    <div
                      className="flex items-center gap-2"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {block.icon}
                      <p className="text-[15px] font-bold">{block.title}</p>
                    </div>
                    <p
                      className="text-[13.5px] leading-[1.5]"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {block.description}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
