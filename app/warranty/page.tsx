import Link from "next/link";
import ShopLayout from "@/components/layout/ShopLayout";

const covered = [
  "Manufacturing defects",
  "LED module failure",
  "Electrical components and wiring",
  "Structural integrity of the lamp body",
];

const notCovered = [
  "Accidental damage or drops",
  "Misuse or modifications",
  "Normal wear and surface marks",
  "Third-party parts and accessories",
];

const steps = [
  {
    number: "1",
    title: "Contact us",
    desc: "Email warranty@fasthaus.ae with your order number.",
  },
  {
    number: "2",
    title: "Share details",
    desc: "Send photos or a short video showing the issue.",
  },
  {
    number: "3",
    title: "Repair or replace",
    desc: "We will repair or replace your lamp — usually within a week.",
  },
];

export default function WarrantyPage() {
  return (
    <ShopLayout>
      <div className="max-w-[1280px] mx-auto px-6 py-14">
        <h1 className="text-4xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          2-Year Warranty
        </h1>
        <p className="text-base mb-12 max-w-xl" style={{ color: "var(--color-text-secondary)" }}>
          Every FastHaus lamp is covered for two years from the date of delivery. Simple, honest coverage — no fine print games.
        </p>

        {/* Coverage grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          <div
            className="rounded-xl border p-6"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
              What&apos;s Covered
            </h2>
            <ul className="flex flex-col gap-2">
              {covered.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-accent-amber)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-xl border p-6"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
              What&apos;s Not Covered
            </h2>
            <ul className="flex flex-col gap-2">
              {notCovered.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-border)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How to make a claim */}
        <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>
          How to Make a Claim
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border p-5"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white mb-3"
                style={{ backgroundColor: "var(--color-accent-amber)" }}
              >
                {step.number}
              </div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
                {step.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer strip */}
        <div
          className="rounded-xl border p-5 flex items-center justify-between gap-4"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Questions about your coverage?{" "}
            <a href="mailto:warranty@fasthaus.ae" className="font-medium" style={{ color: "var(--color-text-primary)" }}>
              warranty@fasthaus.ae
            </a>
          </p>
          <Link
            href="/contact"
            className="flex-shrink-0 px-5 py-2.5 rounded-full border text-sm font-medium"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
          >
            Contact support
          </Link>
        </div>
      </div>
    </ShopLayout>
  );
}
