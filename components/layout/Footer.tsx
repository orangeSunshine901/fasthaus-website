import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "@/components/ui/NewsletterForm";

const columns = [
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Help Center", href: "/faq" },
      { label: "Documentation", href: "#" },
      { label: "Tutorials", href: "#" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "Cloud Solutions", href: "#" },
      { label: "AI Tools", href: "#" },
      { label: "Sustainable Solutions", href: "#" },
      { label: "Telehealth Services", href: "#" },
    ],
  },
  {
    heading: "Social",
    links: [
      { label: "Twitter", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "Instagram", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand + Newsletter */}
          <div className="md:col-span-1">
            <Link href="/">
              <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={110} height={26} />
            </Link>
            <p className="mt-4 text-xs font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
              Subscribe to Newsletter <span className="text-[var(--color-error)]">*</span>
            </p>
            <NewsletterForm />
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Agree{" "}
              <Link href="#" className="underline" style={{ color: "var(--color-text-secondary)" }}>
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline" style={{ color: "var(--color-text-secondary)" }}>
                Conditions
              </Link>
              .
            </p>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-[var(--color-accent-amber)]"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div
          className="flex flex-col md:flex-row items-center justify-between pt-6 border-t gap-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            © 2026 Fasthaus Studio
          </p>
          <div className="flex items-center gap-3">
            {["Visa", "Stripe", "MC", "G Pay", "Apple Pay", "Klarna", "PayPal"].map((p) => (
              <span
                key={p}
                className="text-[10px] px-2 py-1 rounded border font-medium"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
