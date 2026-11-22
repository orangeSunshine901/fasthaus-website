"use client";

import Script from "next/script";
import { initializeSilktide as initializeSharedSilktide } from "@/lib/consent/config";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setPageScrollLocked } from "@/lib/page-scroll-lock";

const dispatchConsentChange = () => {
  setPageScrollLocked("cookie-consent", false);
  window.dispatchEvent(new CustomEvent("fasthaus:consent-change"));
};

function initializeSilktide() {
  initializeSharedSilktide(dispatchConsentChange, {
    onPromptOpen: () =>
      setPageScrollLocked("cookie-consent", window.matchMedia("(min-width: 768px)").matches),
    onPromptClose: () => setPageScrollLocked("cookie-consent", false),
  });
}

export default function SilktideConsentManager() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  useEffect(() => {
    if (isAdmin) {
      window.silktideConsentManager?.getInstance()?.destroy();
      setPageScrollLocked("cookie-consent", false);
    }
  }, [isAdmin]);
  if (isAdmin) return null;
  return (
    <Script
      id="silktide-consent-manager"
      src="/site-preferences.js"
      strategy="afterInteractive"
      onReady={initializeSilktide}
      onError={() => setPageScrollLocked("cookie-consent", false)}
    />
  );
}
