"use client";

import { createContext, useContext } from "react";
import type { AnalyticsConsentState } from "@/lib/consent/silktide";

const AnalyticsConsentContext = createContext<AnalyticsConsentState>("unknown");

export function useAnalyticsConsent(): AnalyticsConsentState {
  return useContext(AnalyticsConsentContext);
}

export { AnalyticsConsentContext };
export type { AnalyticsConsentState };
