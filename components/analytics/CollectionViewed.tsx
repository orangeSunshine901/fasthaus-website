"use client";

import { useEffect, useRef } from "react";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";
import { useAnalyticsConsent } from "@/providers/AnalyticsConsentContext";

export default function CollectionViewed({ collection, productCount }: { collection: string; productCount: number }) {
  const consent = useAnalyticsConsent();
  const capturedKey = useRef<string | null>(null);

  useEffect(() => {
    if (consent !== "granted") return;

    const eventKey = `${collection}:${productCount}`;
    if (capturedKey.current === eventKey) return;

    capture(analyticsEvents.collectionViewed, { collection, product_count: productCount });
    capturedKey.current = eventKey;
  }, [collection, productCount, consent]);

  return null;
}
