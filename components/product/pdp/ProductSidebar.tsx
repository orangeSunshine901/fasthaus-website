"use client";

import Image from "next/image";
import type { AddOn } from "@/lib/data/products";
import DirhamPrice from "@/components/ui/DirhamPrice";

type Props = {
  addOns: AddOn[];
  selectedAddOns: Set<string>;
  onToggleAddOn: (id: string) => void;
  onShowShippingDetails: () => void;
};

export default function ProductSidebar({
  addOns,
  selectedAddOns,
  onToggleAddOn,
  onShowShippingDetails,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-5">
      {/* Add-ons card */}
      {addOns.length > 0 && (
        <div
          className="flex flex-col gap-5 rounded-[16px] border bg-white p-[22px]"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center justify-between">
            <h2
              className="text-[17px] font-extrabold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Add-ons
            </h2>
            <span
              className="rounded-full border px-2.5 py-1 text-[12px] font-bold"
              style={{
                borderColor: "var(--color-accent-amber)",
                color: "var(--color-accent-amber)",
              }}
            >
              Recommended
            </span>
          </div>
          {addOns.map((addOn) => (
            <label
              key={addOn.id}
              className="-m-3.5 grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_74px] items-start gap-3 rounded-[12px] p-3.5 transition-colors hover:bg-[var(--color-surface)]"
            >
              <input
                type="checkbox"
                checked={selectedAddOns.has(addOn.id)}
                onChange={() => onToggleAddOn(addOn.id)}
                className="mt-0.5 h-[18px] w-[18px] cursor-pointer"
                style={{ accentColor: "var(--color-accent-amber)" }}
                aria-label={`Add ${addOn.name}`}
              />
              <div className="flex flex-col gap-[5px]">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="text-[15px] font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {addOn.name}
                  </span>
                  <DirhamPrice amount={addOn.price} size="sm" className="shrink-0 font-bold" />
                </div>
                <span
                  className="text-[13.5px] leading-[1.5]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {addOn.description}
                </span>
              </div>
              <div
                className="relative h-[60px] w-[74px] shrink-0 overflow-hidden rounded-[10px]"
                style={{ backgroundColor: "var(--color-surface-muted)" }}
              >
                <Image
                  src={addOn.image}
                  alt={addOn.name}
                  fill
                  sizes="74px"
                  className="object-cover"
                />
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Delivery & Production card */}
      <div
        className="flex flex-col gap-3.5 rounded-[16px] p-[22px]"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <h2 className="text-[17px] font-extrabold" style={{ color: "var(--color-text-primary)" }}>
          Delivery &amp; Production
        </h2>
        <div className="flex flex-col gap-2.5 text-[14.5px]">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Made to order
            </span>
            <span className="font-bold" style={{ color: "var(--color-text-primary)" }}>
              2–3 business days
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Delivery
            </span>
            <span className="font-bold" style={{ color: "var(--color-text-primary)" }}>
              1–2 business days
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onShowShippingDetails}
          className="self-start text-[14px] font-bold hover:underline"
          style={{ color: "var(--color-accent-amber)" }}
        >
          See shipping details →
        </button>
      </div>
    </div>
  );
}
