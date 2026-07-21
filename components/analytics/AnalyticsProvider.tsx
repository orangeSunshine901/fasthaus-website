"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { capture, captureException, setAnalyticsConsent } from "@/lib/analytics/client";
import { readSilktideAnalyticsConsent } from "@/lib/consent/silktide";
import {
  AnalyticsConsentContext,
  type AnalyticsConsentState,
} from "@/providers/AnalyticsConsentContext";

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<AnalyticsConsentState>("unknown");
  const previousConsent = useRef<AnalyticsConsentState>("unknown");
  const lastPageView = useRef<string | null>(null);

  const applyConsent = useCallback((nextConsent: AnalyticsConsentState) => {
    if (previousConsent.current === nextConsent) return;

    previousConsent.current = nextConsent;
    setConsent(nextConsent);

    const granted = nextConsent === "granted";
    setAnalyticsConsent(granted);

    if (granted) {
      posthog.opt_in_capturing();
      posthog.startSessionRecording();
      return;
    }

    if (nextConsent === "denied") {
      lastPageView.current = null;
      posthog.stopSessionRecording();
      posthog.opt_out_capturing();
      posthog.reset();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;

    const restoreConsent = () => {
      if (cancelled) return;

      const restored = readSilktideAnalyticsConsent();
      if (restored !== "unknown" || attempts >= 50) {
        applyConsent(restored);
        return;
      }

      attempts += 1;
      timer = window.setTimeout(restoreConsent, 100);
    };

    restoreConsent();

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [applyConsent]);

  useEffect(() => {
    const onConsentChange = () => applyConsent(readSilktideAnalyticsConsent());
    window.addEventListener("fasthaus:consent-change", onConsentChange);
    return () => window.removeEventListener("fasthaus:consent-change", onConsentChange);
  }, [applyConsent]);

  useEffect(() => {
    if (consent !== "granted") return;

    const query = searchParams.toString();
    const pageViewKey = query ? `${pathname}?${query}` : pathname;
    if (lastPageView.current === pageViewKey) return;

    lastPageView.current = pageViewKey;
    capture("$pageview", { $current_url: window.location.href });
  }, [pathname, searchParams, consent]);

  useEffect(() => {
    if (consent !== "granted") return;

    const onError = (event: ErrorEvent) =>
      captureException(event.error ?? event.message, { source: "window_error" });
    const onRejection = (event: PromiseRejectionEvent) =>
      captureException(event.reason, { source: "unhandled_rejection" });

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [consent]);

  return (
    <AnalyticsConsentContext.Provider value={consent}>
      {children}
    </AnalyticsConsentContext.Provider>
  );
}
