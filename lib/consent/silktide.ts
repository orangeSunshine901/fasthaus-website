export type AnalyticsConsentState = "unknown" | "granted" | "denied";

export function toAnalyticsConsentState(choice: boolean | null): AnalyticsConsentState {
  if (choice === true) return "granted";
  if (choice === false) return "denied";
  return "unknown";
}

export function readSilktideAnalyticsConsent(): AnalyticsConsentState {
  if (typeof window === "undefined") return "unknown";

  const manager = window.silktideConsentManager?.getInstance();
  if (!manager) return "unknown";

  return toAnalyticsConsentState(manager.getConsentChoice("analytics"));
}
