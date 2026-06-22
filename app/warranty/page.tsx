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
      <div className="container-page py-10 md:py-14">
        {/* Page header */}
        <h1 className="type-display-xl mb-2" style={{ color: "var(--color-text-primary)" }}>
          2-Year Warranty
        </h1>
        <p className="type-body-md mb-12 max-w-xl" style={{ color: "var(--color-text-secondary)" }}>
          Every FastHaus lamp is covered for two years from the date of delivery. Simple, honest coverage — no fine print games.
        </p>

        {/* Coverage grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          <div
            className="card-surface p-6"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <h2 className="type-title-md mb-4" style={{ color: "var(--color-text-primary)" }}>
              What&apos;s Covered
            </h2>
            <ul className="flex flex-col gap-2">
              {covered.map((item) => (
                <li key={item} className="type-body-sm flex items-center gap-2" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-accent-amber)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="card-surface p-6"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <h2 className="type-title-md mb-4" style={{ color: "var(--color-text-primary)" }}>
              What&apos;s Not Covered
            </h2>
            <ul className="flex flex-col gap-2">
              {notCovered.map((item) => (
                <li key={item} className="type-body-sm flex items-center gap-2" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-border)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How to make a claim */}
        <h2 className="type-display-lg mb-6" style={{ color: "var(--color-text-primary)" }}>
          How to Make a Claim
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="card-surface p-5"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
            >
              <div
                className="type-caption mb-3 flex h-8 w-8 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: "var(--color-accent-amber)" }}
              >
                {step.number}
              </div>
              <h3 className="type-title-md mb-1" style={{ color: "var(--color-text-primary)" }}>
                {step.title}
              </h3>
              <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer strip */}
        <div
          className="panel-surface flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
            Questions about your coverage?{" "}
            <a href="mailto:warranty@fasthaus.ae" className="font-medium" style={{ color: "var(--color-text-primary)" }}>
              warranty@fasthaus.ae
            </a>
          </p>
          <Link
            href="/contact"
            className="btn btn-outline min-h-10 flex-shrink-0 self-start px-5 py-2.5 sm:self-auto"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
          >
            Contact support
          </Link>
        </div>
      </div>
    </ShopLayout>
  );
}
