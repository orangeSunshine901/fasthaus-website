import { Gift, Truck, Leaf, Shield } from "lucide-react";
import { GIFT_WITH_ORDER_ENABLED } from "@/lib/promotions";
import AnnouncementRibbon from "@/components/animata/container/announcement-ribbon";

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
  const mobileItems = GIFT_WITH_ORDER_ENABLED
    ? [{ icon: Gift, label: "A gift with every lamp order" }, ...items]
    : items;

  return (
    <>
      <AnnouncementRibbon
        className="md:hidden"
        data-home-announcement-reveal-item={revealOnFirstScroll ? "" : undefined}
        message={
          <div className="flex items-center gap-8 px-4 text-[var(--color-text-primary)]">
            {mobileItems.map(({ icon: Icon, label }) => (
              <span key={label} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium">
                <Icon size={14} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        }
      />
      <div
        data-home-announcement-reveal-item={revealOnFirstScroll ? "" : undefined}
        className="hidden h-11 w-full items-center bg-[#ff7a1a] px-4 text-[var(--color-text-primary)] md:flex"
      >
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center gap-8 lg:gap-12">
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-normal">
            <LeadIcon size={14} aria-hidden="true" />
            {GIFT_WITH_ORDER_ENABLED ? "A gift with every lamp order" : "Free shipping"}
          </span>
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
    </>
  );
}
