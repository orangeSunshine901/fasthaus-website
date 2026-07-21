import posthog from "posthog-js";
import type { AnalyticsEvent, AnalyticsProperties } from "./events";

let analyticsConsentGranted = false;

export function setAnalyticsConsent(granted: boolean): void {
  analyticsConsentGranted = granted;
}

export function hasAnalyticsConsent(): boolean {
  return analyticsConsentGranted;
}

export function capture(event: AnalyticsEvent | "$pageview", properties: AnalyticsProperties = {}) {
  if (!hasAnalyticsConsent()) return;
  posthog.capture(event, properties);
}

export function captureException(error: unknown, context?: AnalyticsProperties) {
  if (!hasAnalyticsConsent()) return;
  posthog.captureException(error, context);
}
