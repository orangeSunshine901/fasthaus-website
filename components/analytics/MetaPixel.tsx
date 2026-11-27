"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useMarketingConsent } from "@/lib/consent/use-marketing-consent";
import {
  isStorefrontMetaPage,
  metaPixelId,
  revokeMetaConsent,
  suspendMetaPixel,
  trackMetaPageView,
} from "@/lib/analytics/meta-client";

export default function MetaPixel() {
  const consent = useMarketingConsent();
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const revoked = useRef(false);

  useEffect(() => {
    if (!metaPixelId()) return;
    if (consent === "denied") {
      revokeMetaConsent();
      if (!revoked.current) {
        revoked.current = true;
        void fetch("/api/analytics/meta/consent", { method: "POST", keepalive: true }).catch(
          () => undefined
        );
      }
      return;
    }
    if (consent === "granted") revoked.current = false;
    if (consent !== "granted" || !isStorefrontMetaPage(pathname)) {
      suspendMetaPixel();
      return;
    }
    trackMetaPageView();
  }, [consent, pathname, query]);

  return null;
}
