import Link from "next/link";
import { Package, MapPin, Clock, RotateCcw, AlertTriangle, Shield } from "lucide-react";
import ShopLayout from "@/components/layout/ShopLayout";

const infoCards = [
  {
    icon: Package,
    title: "Production Time",
    body: "Every FastHaus lamp is made to order at our Dubai studio. Once you place an order, production takes 2–3 business days before your lamp is ready to ship.",
  },
  {
    icon: MapPin,
    title: "Shipping Areas",
    body: "We currently ship to all seven UAE emirates — Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah. International shipping is coming soon.",
  },
  {
    icon: Clock,
    title: "Delivery Estimates",
    body: "After dispatch, delivery typically takes 3–5 business days within the UAE. You will receive a tracking number by email as soon as your order ships.",
  },
  {
    icon: RotateCcw,
    title: "Returns Process",
    body: "We offer 30-day hassle-free returns for any reason. Email returns@fasthaus.ae with your order number and we will arrange a free pickup from your address.",
  },
  {
    icon: AlertTriangle,
    title: "Damaged Goods",
    body: "If your lamp arrives damaged, please photograph it and email us within 48 hours of delivery at support@fasthaus.ae. We will send a replacement at no cost.",
  },
  {
    icon: Shield,
    title: "Warranty",
    body: "Every lamp comes with a 2-year warranty covering manufacturing defects, LED module failure, and structural integrity. See our full Warranty page for details.",
    link: { href: "/warranty", label: "View warranty details →" },
  },
];

export default function ShippingReturnsPage() {
  return (
    <ShopLayout>
      <div className="container-page py-10 md:py-14">
        {/* Page header */}
        <h1 className="type-xl mb-2" style={{ color: "var(--color-text-primary)" }}>
          Shipping & Returns
        </h1>
        <p className="type-base mb-10 max-w-xl" style={{ color: "var(--color-text-secondary)" }}>
          Everything you need to know about how we make, ship, and stand behind every lamp we send out.
        </p>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {infoCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="card-surface flex flex-col gap-4 p-6"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)]"
                  style={{ backgroundColor: "var(--color-surface-muted)" }}
                >
                  <Icon size={18} style={{ color: "var(--color-accent-amber)" }} />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="type-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {card.title}
                  </h2>
                  <p className="type-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {card.body}
                  </p>
                  {card.link && (
                    <Link
                      href={card.link.href}
                      className="btn-text mt-1"
                      style={{ color: "var(--color-accent-amber)" }}
                    >
                      {card.link.label}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact strip */}
        <div
          className="panel-surface mt-10 flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <p className="type-sm" style={{ color: "var(--color-text-secondary)" }}>
            Still have questions?{" "}
            <a href="mailto:support@fasthaus.ae" className="font-medium" style={{ color: "var(--color-text-primary)" }}>
              support@fasthaus.ae
            </a>
          </p>
          <Link
            href="/contact"
            className="btn btn-outline min-h-10 flex-shrink-0 self-start px-5 py-2.5 sm:self-auto"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
          >
            Contact us
          </Link>
        </div>
      </div>
    </ShopLayout>
  );
}
