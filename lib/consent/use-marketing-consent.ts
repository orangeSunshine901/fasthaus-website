"use client";

import { useSyncExternalStore } from "react";
import { readSilktideMarketingConsent } from "./silktide";

function subscribe(onChange: () => void) {
  window.addEventListener("fasthaus:consent-change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("fasthaus:consent-change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useMarketingConsent() {
  return useSyncExternalStore(subscribe, readSilktideMarketingConsent, () => "unknown" as const);
}
