"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";

const columns = [
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
      { label: "Twitter", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "Instagram", href: "#" },
    ],
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

/* Newsletter form inline — footer variant has an envelope icon in the input */
function FooterNewsletter() {
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
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      {/* Email input with envelope icon */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white w-[280px]"
        style={{ borderColor: "var(--color-border)" }}
      >
        <Mail size={16} style={{ color: "var(--color-text-disabled)", flexShrink: 0 }} />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          disabled={state === "loading"}
          className="flex-1 text-sm bg-transparent outline-none min-w-0"
          style={{ color: "var(--color-text-primary)" }}
        />
      </div>
      {/* Subscribe button — dark fill per Figma */}
      <button
        type="submit"
        disabled={state === "loading"}
        className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60 whitespace-nowrap"
        style={{ backgroundColor: "var(--color-text-primary)" }}
      >
        {state === "loading" ? "…" : "Subscribe"}
      </button>
    </form>
  );
}

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="max-w-[1280px] mx-auto px-8 pt-24 pb-8">

        {/* Top row: branding + newsletter left, link columns right */}
        <div className="flex items-start justify-between gap-12 mb-16">

          {/* Branding section */}
          <div className="flex flex-col gap-8 flex-shrink-0">
            <Link href="/">
              <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={128} height={34} />
            </Link>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                Subscribe to Newsletter{" "}
                <span style={{ color: "var(--color-accent-amber)" }}>*</span>
              </p>
              <FooterNewsletter />
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
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
          </div>

          {/* Link columns */}
          <div className="flex gap-12 flex-shrink-0">
            {columns.map((col) => (
              <div key={col.heading} className="flex flex-col gap-2">
                <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
                  {col.heading}
                </p>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm transition-colors hover:text-[var(--color-accent-amber)]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row: copyright + payment icons */}
        <div
          className="flex items-center justify-between pt-6 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Copyright © 2026 Fasthaus Studio
          </p>
          
          {/*/ Payment icons - currently commented out since we don't have them yet, but can be added back in when ready */}

          {/* <div className="flex items-center gap-1">
            {paymentIcons.map((icon) => (
              <div
                key={icon.name}
                className="relative w-9 h-6 rounded-sm border overflow-hidden bg-white"
                style={{ borderColor: "var(--color-border)" }}
              >
                <Image
                  src={icon.src}
                  alt={icon.name}
                  fill
                  className="object-contain p-0.5"
                />
              </div>
            ))}
          </div> */}
        </div>

      </div>
    </footer>
  );
}
