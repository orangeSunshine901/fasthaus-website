"use client";

import Script from "next/script";

const dispatchConsentChange = () => {
  window.dispatchEvent(new CustomEvent("fasthaus:consent-change"));
};

function initializeSilktide() {
  window.silktideConsentManager?.init({
    eventName: "stcm_consent_update",
    backdrop: { show: true },
    icon: { position: "bottomLeft" },
    prompt: { position: "bottomRight" },
    consentTypes: [
      {
        id: "essential",
        label: "Essential cookies",
        description:
          "<p>These cookies are required for Fasthsaus to work correctly. They support essential features such as maintaining your shopping cart, processing checkout securely, remembering your cookie preferences and protecting the website from misuse. They cannot be disabled.</p>",
        required: true,
        gtag: ["functionality_storage", "security_storage"],
      },
      {
        id: "analytics",
        label: "Analytics cookies",
        description:
          "<p>These cookies help us understand how visitors use Fasthaus, which products and pages are most popular, and where we can improve the shopping experience. They may also support privacy-protected session replay and error monitoring.</p>",
        required: false,
        defaultValue: false,
        gtag: "analytics_storage",
        onAccept: dispatchConsentChange,
        onReject: dispatchConsentChange,
      },
      {
        id: "marketing",
        label: "Marketing cookies",
        description:
          "<p>These cookies help us measure advertising performance, understand which campaigns lead to visits or purchases, and show more relevant advertising on other websites and platforms.</p>",
        required: false,
        defaultValue: false,
        gtag: ["ad_storage", "ad_user_data", "ad_personalization"],
      },
    ],
    text: {
      prompt: {
        description:
          "<p>We use essential cookies to run Fasthaus and, with your permission, optional cookies to understand and improve your experience.</p>",
        acceptAllButtonText: "Accept all",
        acceptAllButtonAccessibleLabel: "Accept all cookies",
        rejectNonEssentialButtonText: "Reject non-essential",
        rejectNonEssentialButtonAccessibleLabel: "Reject all non-essential cookies",
        preferencesButtonText: "Preferences",
        preferencesButtonAccessibleLabel: "Open cookie preferences",
      },
      preferences: {
        title: "Customize your cookie preferences",
        description:
          "<p>We respect your right to privacy. You can choose not to allow optional cookie types. Your preferences apply across Fasthaus.</p>",
        saveButtonText: "Save and close",
        saveButtonAccessibleLabel: "Save your cookie preferences",
        creditLinkText: "Consent Manager by Silktide",
        creditLinkAccessibleLabel: "Visit Silktide Consent Manager",
      },
    },
  });
}

export default function SilktideConsentManager() {
  return (
    <Script
      id="silktide-consent-manager"
      src="/silktide-consent-manager.js"
      strategy="afterInteractive"
      onReady={initializeSilktide}
    />
  );
}
