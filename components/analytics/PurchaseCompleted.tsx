"use client";

import { useEffect, useRef } from "react";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";
import { useAnalyticsConsent } from "@/providers/AnalyticsConsentContext";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function PurchaseCompleted({
  orderId,
  revenue,
  itemCount,
}: {
  orderId: string;
  revenue: number;
  itemCount: number;
}) {
  const consent = useAnalyticsConsent();
  const capturedOrder = useRef<string | null>(null);
  const convertedOrder = useRef<string | null>(null);

  useEffect(() => {
    if (convertedOrder.current === orderId) return;

    window.gtag?.("event", "conversion", {
      send_to: "AW-18420023335/8d6TCIW5u_UcEKeArc9E",
      value: revenue,
      currency: "AED",
      transaction_id: orderId,
    });
    convertedOrder.current = orderId;
  }, [orderId, revenue]);

  useEffect(() => {
    if (consent !== "granted" || capturedOrder.current === orderId) return;

    capture(analyticsEvents.purchaseCompleted, {
      $insert_id: `purchase:${orderId}`,
      order_id: orderId,
      revenue,
      currency: "AED",
      item_count: itemCount,
      source: "order_confirmation",
    });
    capturedOrder.current = orderId;
  }, [consent, itemCount, orderId, revenue]);

  return null;
}
