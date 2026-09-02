export {};

type SilktideConsentType = {
  id: string;
  label: string;
  description: string;
  required: boolean;
  defaultValue?: boolean;
  gtag?: string | string[];
  onAccept?: () => void;
  onReject?: () => void;
};

type SilktideConsentManagerConfig = {
  onPromptOpen?: () => void;
  onPromptClose?: () => void;
  backdrop?: { show?: boolean };
  icon?: { position?: string };
  prompt?: {
    position?: string;
    showRejectNonEssentialButton?: boolean;
  };
  eventName?: string;
  consentTypes: SilktideConsentType[];
  text?: {
    prompt?: Record<string, string>;
    preferences?: Record<string, string>;
  };
};

type SilktideConsentManagerInstance = {
  getConsentChoice: (id: string) => boolean | null;
  getAcceptedConsents: () => Record<string, boolean | null>;
  getRejectedConsents: () => Record<string, boolean>;
};

type SilktideConsentManager = {
  init: (config: SilktideConsentManagerConfig) => void;
  update: (config: Partial<SilktideConsentManagerConfig>) => void;
  getInstance: () => SilktideConsentManagerInstance | null;
  resetConsent: () => void;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    silktideConsentManager?: SilktideConsentManager;
  }
}
