import { Truck, RotateCcw, Leaf, Shield } from "lucide-react";

const items = [
  { icon: Truck, label: "Free shipping" },
  { icon: RotateCcw, label: "30-day hassle-free returns" },
  { icon: Leaf, label: "Eco-friendly materials" },
  { icon: Shield, label: "2-year warranty" },
];

export default function AnnouncementBar() {
  return (
    <div className="w-full py-2 px-4" style={{ backgroundColor: "var(--color-highlight)" }}>
      <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-8 flex-wrap">
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
  );
}
