"use client";

import { useState } from "react";
import { Mail, MessageCircle, AtSign, MapPin, Clock } from "lucide-react";
import ShopLayout from "@/components/layout/ShopLayout";

type State = "idle" | "loading" | "success" | "error";

const details = [
  { icon: Mail, label: "Email", value: "hello@fasthaus.ae" },
  { icon: MessageCircle, label: "WhatsApp", value: "+971 50 123 4567" },
  { icon: AtSign, label: "Instagram", value: "@fasthaus.studio" },
  { icon: MapPin, label: "Location", value: "Al Quoz, Dubai, UAE" },
  { icon: Clock, label: "Business Hours", value: "Sun – Thu, 9:00 – 18:00" },
];

export default function ContactPage() {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong");
        setState("error");
        return;
      }
      setState("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("error");
    }
  }

  return (
    <ShopLayout>
      <div className="max-w-[1280px] mx-auto px-6 py-14">
        {/* Page header */}
        <h1 className="text-4xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Get in Touch
        </h1>
        <p className="text-base mb-12" style={{ color: "var(--color-text-secondary)" }}>
          Questions about a lamp, an order, or a custom project? We usually reply within one business day.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact form */}
          <div
            className="rounded-xl border p-6"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <h2 className="text-lg font-semibold mb-5" style={{ color: "var(--color-text-primary)" }}>
              Send us a message
            </h2>
            {/* Success state */}
            {state === "success" ? (
              <div className="py-8 text-center">
                <p className="text-base font-medium mb-2" style={{ color: "var(--color-success)" }}>
                  Message sent!
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Name</label>
                    <input
                      required placeholder="Your full name"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)]"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Email</label>
                    <input
                      required type="email" placeholder="you@example.com"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)]"
                      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Subject</label>
                  <input
                    required placeholder="What's this about?"
                    value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)]"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Message</label>
                  <textarea
                    required placeholder="How can we help?"
                    value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)] resize-none"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                  />
                </div>
                {errorMsg && (
                  <p className="text-xs" style={{ color: "var(--color-error)" }}>{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="w-full h-12 rounded-full text-sm font-medium text-white disabled:opacity-60"
                  style={{ backgroundColor: "var(--color-accent-amber)" }}
                >
                  {state === "loading" ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>

          {/* Contact details */}
          <div
            className="rounded-xl border p-6 h-fit"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <h2 className="text-lg font-semibold mb-5" style={{ color: "var(--color-text-primary)" }}>
              Contact details
            </h2>
            <div className="flex flex-col gap-4">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--color-surface-muted)" }}
                  >
                    <Icon size={16} style={{ color: "var(--color-text-secondary)" }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
