"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";

type FooterLink = {
  label: string;
  href?: string;
};

type FooterColumn = {
  heading: string;
  links: FooterLink[];
};

const desktopColumns: FooterColumn[] = [
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    heading: "Social",
    links: [
      { label: "Twitter" },
      { label: "LinkedIn" },
      { label: "Facebook" },
      { label: "Instagram" },
    ],
  },
];

const mobileColumns: FooterColumn[] = [
  {
    heading: "Shop",
    links: [
      { label: "All Lamps", href: "/collection" },
      { label: "Desk Lamps", href: "/collection/desk-lamps" },
      { label: "Bedside Lamps", href: "/collection/table-lamps" },
      { label: "Ambient Lamps", href: "/collection/floor-lamps" },
    ],
  },
  {
    heading: "Studio",
    links: [
      { label: "About FastHaus", href: "/about" },
      { label: "Custom Projects", href: "/contact" },
      { label: "Journal" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Warranty", href: "/warranty" },
      { label: "Care Guide" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Contact",
    links: [{ label: "WhatsApp" }, { label: "Email", href: "/contact" }, { label: "Instagram" }],
  },
];

const paymentIcons = [
  { name: "Visa", src: "/payment/visa.png" },
  { name: "Stripe", src: "/payment/stripe.png" },
  { name: "Mastercard", src: "/payment/mastercard.png" },
  { name: "G Pay", src: "/payment/gpay.png" },
  { name: "Apple Pay", src: "/payment/applepay.png" },
  { name: "Klarna", src: "/payment/klarna.png" },
  { name: "PayPal", src: "/payment/paypal.png" },
];

function FooterNewsletter({ caption }: { caption?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "success" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p className="text-sm" style={{ color: "var(--color-success)" }}>
        Thanks for subscribing!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {caption && (
        <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
          {caption}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div
          className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-sm)] border bg-white px-3 py-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Mail size={16} style={{ color: "var(--color-text-disabled)", flexShrink: 0 }} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            disabled={state === "loading"}
            className="type-body-sm min-w-0 flex-1 bg-transparent outline-none"
            style={{ color: "var(--color-text-primary)" }}
          />
        </div>
        <button
          type="submit"
          disabled={state === "loading"}
          className="btn btn-primary min-h-12 flex-shrink-0 whitespace-nowrap px-4 disabled:opacity-60"
          style={{ backgroundColor: "var(--color-accent-amber)" }}
        >
          {state === "loading" ? "…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      {/* ── MOBILE ── */}
      <div className="flex flex-col gap-8 px-5 pb-6 pt-10 md:hidden">
        <div className="flex flex-col gap-4">
          <Link href="/">
            <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={110} height={26} />
          </Link>
          <FooterNewsletter caption="New lamp releases, studio notes, and early access to limited drops." />
        </div>

        {/* 2×2 link grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8">
          {mobileColumns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-2">
              <p className="type-title-md mb-1" style={{ color: "var(--color-text-primary)" }}>
                {col.heading}
              </p>
              {col.links.map((link) =>
                link.href ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="type-body-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <span
                    key={link.label}
                    className="type-body-sm cursor-default"
                    style={{ color: "var(--color-text-disabled)" }}
                  >
                    {link.label}
                  </span>
                )
              )}
            </div>
          ))}
        </div>

        <div
          className="flex flex-col gap-3 pt-4 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="type-caption-sm" style={{ color: "var(--color-text-secondary)" }}>
            © 2026 FastHaus. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            {paymentIcons.slice(0, 4).map((icon) => (
              <div
                key={icon.name}
                className="relative w-9 h-6 rounded-sm border overflow-hidden bg-white"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Image src={icon.src} alt={icon.name} fill className="object-contain p-0.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="container-page hidden pb-8 pt-16 md:block">
        <div className="mb-16 flex items-start justify-between gap-12">
          {/* Branding + newsletter */}
          <div className="flex flex-col gap-8 flex-shrink-0">
            <Link href="/">
              <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={128} height={34} />
            </Link>
            <div className="flex flex-col gap-2">
              <p className="type-caption" style={{ color: "var(--color-text-primary)" }}>
                Subscribe to Newsletter{" "}
                <span style={{ color: "var(--color-accent-amber)" }}>*</span>
              </p>
              <FooterNewsletter />
              <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
                Agree <span style={{ color: "var(--color-text-secondary)" }}>Terms</span> and{" "}
                <span style={{ color: "var(--color-text-secondary)" }}>Conditions</span>.
              </p>
            </div>
          </div>

          {/* Desktop columns */}
          <div className="flex gap-12 flex-shrink-0">
            {desktopColumns.map((col) => (
              <div key={col.heading} className="flex flex-col gap-2">
                <p className="type-caption mb-1" style={{ color: "var(--color-text-primary)" }}>
                  {col.heading}
                </p>
                {col.links.map((link) =>
                  link.href ? (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="type-body-sm transition-colors hover:text-[var(--color-accent-amber)]"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span
                      key={link.label}
                      className="type-body-sm cursor-default"
                      style={{ color: "var(--color-text-disabled)" }}
                    >
                      {link.label}
                    </span>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex items-center justify-between pt-6 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="type-caption" style={{ color: "var(--color-text-secondary)" }}>
            Copyright © 2026 Fasthaus Studio
          </p>
          <div className="flex items-center gap-1">
            {paymentIcons.map((icon) => (
              <div
                key={icon.name}
                className="relative w-9 h-6 rounded-sm border overflow-hidden bg-white"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Image src={icon.src} alt={icon.name} fill className="object-contain p-0.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
