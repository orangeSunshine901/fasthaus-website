import { Gift, Truck, Leaf, Shield } from "lucide-react";
import { GIFT_WITH_ORDER_ENABLED } from "@/lib/promotions";

const items = [
  { icon: Truck, label: "Free shipping" },
  { icon: Leaf, label: "Eco-friendly materials" },
  { icon: Shield, label: "1-year warranty" },
];

export default function AnnouncementBar({
  revealOnFirstScroll = false,
}: {
  revealOnFirstScroll?: boolean;
}) {
  const LeadIcon = GIFT_WITH_ORDER_ENABLED ? Gift : Truck;

  return (
    <div
      data-home-announcement-reveal-item={revealOnFirstScroll ? "" : undefined}
      className="flex h-11 w-full items-center bg-[#ff7a1a] px-4 text-[var(--color-text-primary)]"
    >
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center gap-8 lg:gap-12">
        <p className="flex shrink-0 items-center gap-2 text-xs font-semibold sm:text-sm">
          <LeadIcon size={16} strokeWidth={1.75} aria-hidden="true" />
          {GIFT_WITH_ORDER_ENABLED ? "A gift with every lamp order" : "Free shipping"}
        </p>
        <div className="hidden items-center gap-5 border-l border-current/20 pl-8 md:flex lg:gap-8 lg:pl-12">
          {items.filter(({ icon }) => GIFT_WITH_ORDER_ENABLED || icon !== Truck).map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 whitespace-nowrap text-xs font-normal">
              <Icon size={14} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
