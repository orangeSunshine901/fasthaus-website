"use client";

import { useState } from "react";

type State = "idle" | "loading" | "success" | "error";

type NewsletterFormProps = {
  variant?: "default" | "featured";
};

export default function NewsletterForm({ variant = "default" }: NewsletterFormProps) {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong");
        setState("error");
        return;
      }
      setState("success");
    } catch {
      setErrorMsg("Something went wrong");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p
        className="text-sm"
        style={{ color: variant === "featured" ? "var(--color-text-primary)" : "var(--color-success)" }}
      >
        Thanks for subscribing!
      </p>
    );
  }

  if (variant === "featured") {
    return (
      <form className="mx-auto flex w-full max-w-[620px] flex-col gap-3" onSubmit={handleSubmit}>
        <label
          htmlFor="newsletter-email"
          className="text-left text-[14px] font-medium leading-none"
          style={{ color: "var(--color-text-primary)" }}
        >
          Subscribe to Newsletter *
        </label>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex h-[58px] flex-1 items-center gap-3 rounded-full bg-white px-5">
            <svg
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 7.5C4 6.67157 4.67157 6 5.5 6H18.5C19.3284 6 20 6.67157 20 7.5V16.5C20 17.3284 19.3284 18 18.5 18H5.5C4.67157 18 4 17.3284 4 16.5V7.5Z"
                stroke="#1A1A1A"
                strokeWidth="1.5"
              />
              <path
                d="M5 7L12 12.25L19 7"
                stroke="#1A1A1A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={state === "loading"}
              className="h-full flex-1 bg-transparent text-sm text-[#1A1A1A] outline-none placeholder:text-[#6B6B6B]"
            />
          </div>
          <button
            type="submit"
            disabled={state === "loading"}
            className="h-[58px] rounded-full bg-[#1A1A1A] px-7 text-sm font-medium text-white transition-opacity disabled:opacity-60"
          >
            {state === "loading" ? "…" : "subscribe"}
          </button>
        </div>
        {errorMsg && (
          <p className="text-left text-xs" style={{ color: "var(--color-text-primary)" }}>{errorMsg}</p>
        )}
      </form>
    );
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        id="newsletter-email"
        type="email"
        required
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state === "loading"}
        className="flex-1 h-11 px-4 rounded-lg border text-sm outline-none focus:border-[var(--color-accent-amber)]"
        style={{ borderColor: errorMsg ? "var(--color-error)" : "var(--color-border)", backgroundColor: "var(--color-bg)" }}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="h-11 px-5 rounded-full text-sm font-medium text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--color-text-primary)" }}
      >
        {state === "loading" ? "…" : "Subscribe"}
      </button>
      {errorMsg && (
        <p className="text-xs mt-1 absolute" style={{ color: "var(--color-error)" }}>{errorMsg}</p>
      )}
    </form>
  );
}
