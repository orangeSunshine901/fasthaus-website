"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type FooterLink = {
  label: string;
  href?: string;
};

type FooterColumn = {
  heading: string;
  links: FooterLink[];
};

const linkColumns: FooterColumn[] = [
  {
    heading: "Shop",
    links: [{ label: "Collection", href: "/collection" }],
  },
  {
    heading: "Studio",
    links: [
      { label: "About Fasthaus", href: "/about" },
      { label: "Custom Projects", href: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping Policy", href: "/legal/shipping" },
      { label: "Refund & Returns", href: "/legal/refunds" },
      { label: "Warranty", href: "/legal/warranty" },
      // { label: "Care Guide" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Contact",
    links: [{ label: "WhatsApp" }, { label: "Email", href: "/contact" }, { label: "Instagram" }],
  },
];

const legalLinks: { label: string; href: string }[] = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Cookies", href: "/legal/cookies" },
];

const paymentMethods = ["VISA", "MASTERCARD", "AMEX", "G PAY", "APPLE PAY", "TABBY"];

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

  return (
    <div className="flex flex-col gap-3">
      {caption && (
        <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
          {caption}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          disabled={state === "loading" || state === "success"}
          className="h-12 min-w-0 flex-1 rounded-xl border bg-white px-4 text-[14.5px] outline-none transition-colors focus:border-[var(--color-accent-amber)]"
          style={{ borderColor: "#E5DED5", color: "var(--color-text-primary)" }}
        />
        <button
          type="submit"
          disabled={state === "loading" || state === "success"}
          className="h-12 flex-shrink-0 whitespace-nowrap rounded-xl border-none px-[22px] text-[14.5px] font-bold text-white transition-[filter] hover:brightness-[0.94] disabled:hover:brightness-100"
          style={{
            backgroundColor:
              state === "success" ? "var(--color-success)" : "var(--color-accent-amber)",
            cursor: state === "success" ? "default" : "pointer",
            opacity: state === "loading" ? 0.6 : 1,
          }}
        >
          {state === "loading" ? "…" : state === "success" ? "✓ Subscribed" : "Subscribe"}
        </button>
      </form>
      {state === "error" && (
        <p className="text-[12.5px] font-medium" style={{ color: "var(--color-accent-amber)" }}>
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{ backgroundColor: "#FAF7F3", borderColor: "#EEE9E3" }}
    >
      {/* ── MOBILE ── */}
      <div
        className="flex flex-col gap-8 px-5 pt-10 md:hidden"
        style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}
      >
        <div className="flex flex-col gap-4">
          <Link href="/">
            <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={110} height={26} />
          </Link>
          <FooterNewsletter caption="New lamp releases, studio notes, and early access to limited drops." />
        </div>

        {/* 2×2 link grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8">
          {linkColumns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-1">
              <p className="type-title-sm mb-1" style={{ color: "var(--color-text-primary)" }}>
                {col.heading}
              </p>
              {col.links.map((link) =>
                link.href ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="type-body-sm py-1.5"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <span
                    key={link.label}
                    className="type-body-sm cursor-default py-1.5"
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
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="type-body-sm py-1.5 font-semibold"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
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
      <div className="hidden md:block">
        <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,400px)_1fr_1fr_1fr_1fr] gap-14 px-8 pb-12 pt-16">
          {/* Branding + newsletter */}
          <div className="flex flex-col gap-4">
            <Link href="/">
              <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={128} height={34} />
            </Link>
            <p
              className="text-[14.5px] font-medium leading-[1.6]"
              style={{ color: "#6E655B", textWrap: "pretty" }}
            >
              New lamp releases, studio notes, and early access to limited drops.
            </p>
            <FooterNewsletter />
            <p className="text-[12.5px] font-medium" style={{ color: "#8A8075" }}>
              By subscribing you agree to our{" "}
              <Link
                href="/legal/terms"
                className="underline transition-colors hover:text-[var(--color-accent-amber)]"
              >
                Terms and Conditions
              </Link>
              .
            </p>
          </div>

          {/* Link columns */}
          {linkColumns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3.5">
              <span
                className="text-[13px] font-bold uppercase tracking-[0.08em]"
                style={{ color: "#8A8075" }}
              >
                {col.heading}
              </span>
              {col.links.map((link) =>
                link.href ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-[14.5px] font-medium transition-colors hover:text-[var(--color-accent-amber)]"
                    style={{ color: "#3A332B" }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <span
                    key={link.label}
                    className="text-[14.5px] font-medium cursor-default"
                    style={{ color: "var(--color-text-disabled)" }}
                  >
                    {link.label}
                  </span>
                )
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 border-t px-8 pb-9 pt-5"
          style={{ borderColor: "#EEE9E3" }}
        >
          <span className="text-[13px] font-medium" style={{ color: "#8A8075" }}>
            © 2026 Fasthaus Studio. All rights reserved.
          </span>
          <div className="flex items-center gap-5">
            <div className="flex gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13px] font-semibold transition-colors hover:text-[var(--color-accent-amber)]"
                  style={{ color: "#8A8075" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="rounded-md border bg-white px-2 py-1 text-[11px] font-bold tracking-[0.04em]"
                  style={{ borderColor: "#E5DED5", color: "#6E655B" }}
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
