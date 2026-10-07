"use client";

import { useState } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import Link from "next/link";

export default function ShippingNotification({ email, name }: { email: string; name: string }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Portal events still bubble to the checkout form.
    event.stopPropagation();
    if (state === "loading") return;
    const fields = new FormData(event.currentTarget);
    const country = String(fields.get("country") ?? "").trim();
    if (!country) {
      setError("Enter your country or region.");
      setState("error");
      return;
    }
    setState("loading");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "International shipping notification request",
          email: String(fields.get("email") ?? "").trim().toLowerCase(),
          subject: "International shipping notification",
          message: `Please email me when shipping becomes available to my country or region: ${country}.\nSource: checkout shipping notification form.`,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save your request. Please try again.");
      setState("success");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save your request. Please try again.");
      setState("error");
    }
  }

  return (
    <Dialog.Root>
      <div className="type-caption-sm flex flex-wrap items-center gap-x-2 gap-y-1">
        <span style={{ color: "var(--color-text-secondary)" }}>Outside the UAE?</span>
        <Dialog.Trigger asChild>
          <button type="button" className="btn-text underline underline-offset-4">
            Notify me
          </button>
        </Dialog.Trigger>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[101] max-h-[85dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[var(--radius-sm)] p-6 shadow-xl"
          style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-primary)" }}
        >
          <Dialog.Title className="type-title-sm pr-7">International shipping</Dialog.Title>
          <Dialog.Description className="type-body-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
            We currently ship within the UAE. Leave your email and country or region to hear when we ship to you.
          </Dialog.Description>
          <Dialog.Close asChild>
            <button type="button" aria-label="Close" className="absolute right-4 top-4 p-2">
              <X size={18} />
            </button>
          </Dialog.Close>
          {state === "success" ? (
            <p role="status" className="type-body-sm mt-5" style={{ color: "var(--color-success)" }}>
              Thanks! Your request has been saved. We’ll email you when shipping becomes available in your country or region.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
              <label className="type-body-sm flex flex-col gap-1.5">
                Email address
                <input name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={email} className="input-field" disabled={state === "loading"} />
              </label>
              <label className="type-body-sm flex flex-col gap-1.5">
                Country or region
                <input name="country" autoComplete="country-name" required maxLength={100} placeholder="e.g. Saudi Arabia" className="input-field" disabled={state === "loading"} />
              </label>
              <p className="type-caption-sm" style={{ color: "var(--color-text-secondary)" }}>
                By clicking Notify me, you agree to receive an email about shipping availability. See our{" "}
                <Link href="/legal/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
              </p>
              {error && <p role="alert" className="type-caption-sm" style={{ color: "var(--color-error)" }}>{error}</p>}
              <button type="submit" className="btn btn-secondary min-h-12 disabled:opacity-60" disabled={state === "loading"}>
                {state === "loading" ? "Saving…" : "Notify me"}
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
