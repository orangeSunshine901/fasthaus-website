import posthog from "posthog-js";
import type { AnalyticsEvent, AnalyticsProperties } from "./events";

export const ANALYTICS_CONSENT_KEY = "fasthaus-analytics-consent";

export function hasAnalyticsConsent() {
  return typeof window !== "undefined" && localStorage.getItem(ANALYTICS_CONSENT_KEY) === "granted";
}

export function capture(event: AnalyticsEvent, properties: AnalyticsProperties = {}) {
  if (!hasAnalyticsConsent()) return;
  posthog.capture(event, properties);
}

export function captureException(error: unknown, context?: AnalyticsProperties) {
  if (!hasAnalyticsConsent()) return;
  posthog.captureException(error, context);
}
