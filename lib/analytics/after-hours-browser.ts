import posthog from "posthog-js";
import { analyticsEvents, type AnalyticsEvent, type AnalyticsProperties } from "./events";
import { capture, setAnalyticsConsent } from "./client";
import { posthogConfig } from "./posthog-config";
import { initializeSilktide } from "../consent/config";
import { readSilktideAnalyticsConsent } from "../consent/silktide";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
let initialized = false;
let granted = false;
const allowedEvents = new Set<string>(Object.values(analyticsEvents).filter((event) => event.startsWith("after_hours_")));

function applyConsent() {
  const next = readSilktideAnalyticsConsent() === "granted";
  if (next === granted) return;
  granted = next;
  setAnalyticsConsent(next);
  if (next && token) {
    if (!initialized) {
      posthog.init(token, posthogConfig());
      initialized = true;
    }
    posthog.opt_in_capturing();
    posthog.startSessionRecording();
    capture("$pageview", { $current_url: window.location.href });
    const requestedEntry = new URLSearchParams(location.search).get("entry");
    capture(analyticsEvents.afterHoursViewed, {
      game: "after_hours", game_version: "2026-11-22",
      language: document.documentElement.lang === "ar" ? "ar" : "en",
      entry_point: ["home", "invitation", "footer"].includes(requestedEntry ?? "") ? requestedEntry : "direct",
    });
  } else if (initialized) {
    posthog.stopSessionRecording();
    posthog.opt_out_capturing();
    posthog.reset();
  }
}

// No buffer: actions taken before Analytics consent are never replayed later.
document.addEventListener("fasthaus:analytics", (event) => {
  if (!granted || !initialized) return;
  const detail = (event as CustomEvent<{ event: AnalyticsEvent; properties: AnalyticsProperties }>).detail;
  if (!detail || !allowedEvents.has(detail.event)) return;
  try {
    if (detail.event === analyticsEvents.afterHoursExited) {
      posthog.capture(detail.event, detail.properties, { transport: "sendBeacon" });
    } else capture(detail.event, detail.properties);
  } catch { /* Analytics must never interrupt the game. */ }
});

window.addEventListener("fasthaus:consent-change", applyConsent);
document.getElementById("cookie-preferences")?.addEventListener("click", () => {
  document.getElementById("stcm-icon")?.click();
});
window.addEventListener("error", (event) => {
  if (granted && initialized) posthog.captureException(event.error ?? event.message, { source: "after_hours" });
});
window.addEventListener("unhandledrejection", (event) => {
  if (granted && initialized) posthog.captureException(event.reason, { source: "after_hours" });
});

function startConsentManager() {
  initializeSilktide(() => {
    window.dispatchEvent(new CustomEvent("fasthaus:consent-change"));
  });
  applyConsent();
}

if (window.silktideConsentManager) startConsentManager();
else {
  const script = document.createElement("script");
  script.src = "/site-preferences.js";
  script.addEventListener("load", startConsentManager, { once: true });
  document.head.append(script);
}

if (!token && process.env.NODE_ENV !== "production") {
  console.error("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured");
}
