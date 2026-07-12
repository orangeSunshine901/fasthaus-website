"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { ANALYTICS_CONSENT_KEY } from "@/lib/analytics/client";
import { captureException } from "@/lib/analytics/client";

type Consent = "granted" | "denied" | null;

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setConsent(localStorage.getItem(ANALYTICS_CONSENT_KEY) as Consent);
    });
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (consent !== "granted") return;
    posthog.capture("$pageview", { $current_url: window.location.href });
  }, [pathname, searchParams, consent]);

  useEffect(() => {
    if (consent !== "granted") return;
    const onError = (event: ErrorEvent) => captureException(event.error ?? event.message, { source: "window_error" });
    const onRejection = (event: PromiseRejectionEvent) => captureException(event.reason, { source: "unhandled_rejection" });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [consent]);

  function choose(next: Exclude<Consent, null>) {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, next);
    setConsent(next);
    if (next === "granted") {
      posthog.opt_in_capturing();
      posthog.startSessionRecording();
      posthog.capture("$pageview", { $current_url: window.location.href });
    } else {
      posthog.stopSessionRecording();
      posthog.opt_out_capturing();
      posthog.reset();
    }
  }

  return (
    <>
      {children}
      {consent === null && (
        <aside className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl rounded-2xl border bg-white p-5 shadow-xl" aria-label="Cookie consent">
          <p className="type-title-sm">Help us improve FastHaus</p>
          <p className="type-body-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            With your permission, we use privacy-safe analytics and masked session replay. We never capture contact, address, payment, or free-text form data.
          </p>
          <div className="mt-4 flex gap-3">
            <button className="btn btn-primary" onClick={() => choose("granted")}>Accept analytics</button>
            <button className="btn btn-outline" onClick={() => choose("denied")}>Decline</button>
          </div>
        </aside>
      )}
    </>
  );
}
