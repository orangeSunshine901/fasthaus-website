"use client";

import { useEffect, useRef } from "react";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";
import { useAnalyticsConsent } from "@/providers/AnalyticsConsentContext";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export default function PurchaseCompleted({
  orderId,
  revenue,
  value,
  shipping,
  discount,
  items,
  itemCount,
}: {
  orderId: string;
  revenue: number;
  value: number;
  shipping: number;
  discount: number;
  items: Array<{
    id: string;
    item_id: string;
    item_name: string;
    item_variant: string;
    price: number;
    quantity: number;
  }>;
  itemCount: number;
}) {
  const consent = useAnalyticsConsent();
  const capturedOrder = useRef<string | null>(null);
  const pushedOrder = useRef<string | null>(null);

  useEffect(() => {
    if (pushedOrder.current === orderId) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: orderId,
        value,
        currency: "AED",
        shipping,
        tax: 0,
        discount,
        items,
      },
    });
    pushedOrder.current = orderId;
  }, [discount, items, orderId, shipping, value]);

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
