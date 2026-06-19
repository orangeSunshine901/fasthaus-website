"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="text-sm" style={{ color: "var(--color-success)" }}>
        Thanks for subscribing!
      </p>
    );
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
    >
      <input
        type="email"
        required
        placeholder="Enter your email address"
        className="flex-1 h-11 px-4 rounded-lg border text-sm outline-none"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
      />
      <button
        type="submit"
        className="h-11 px-5 rounded-full text-sm font-medium text-white"
        style={{ backgroundColor: "var(--color-text-primary)" }}
      >
        Subscribe
      </button>
    </form>
  );
}
