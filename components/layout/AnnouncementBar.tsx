import { Truck, Leaf, Shield } from "lucide-react";
import AnnouncementRibbon from "@/components/animata/container/announcement-ribbon";

const items = [
  { icon: Truck, label: "Free shipping" },
  { icon: Leaf, label: "Eco-friendly materials" },
  { icon: Shield, label: "1-year warranty" },
];

export default function AnnouncementBar() {
  return (
    <>
      <AnnouncementRibbon
        className="md:hidden"
        pauseOnHover={false}
        message={
          <div className="flex items-center gap-8 px-4">
            {items.map(({ icon: Icon, label }) => (
              <div key={label} className="flex shrink-0 items-center gap-1.5">
                <Icon size={14} style={{ color: "var(--color-text-primary)" }} />
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        }
      />

      {/* Desktop: icon strip */}
      <div className="hidden h-11 w-full bg-[#ff7a1a] px-4 md:block">
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-center gap-32">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={14} style={{ color: "var(--color-text-primary)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
