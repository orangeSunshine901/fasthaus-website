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

// Silktide re-applies the stored consent choice and pushes this event once it initialises,
// which happens after hydration. Pushing the purchase before it would hit GTM while consent
// still reads "denied" from the layout defaults.
const CONSENT_EVENT = "stcm_consent_update";
const CONSENT_WAIT_MS = 3_000;
const CONSENT_POLL_MS = 100;

const purchaseStorageKey = (orderId: string) => `fh_purchase:${orderId}`;

function wasPurchasePushed(orderId: string): boolean {
  try {
    return window.localStorage.getItem(purchaseStorageKey(orderId)) !== null;
  } catch {
    return false;
  }
}

function markPurchasePushed(orderId: string): void {
  try {
    window.localStorage.setItem(purchaseStorageKey(orderId), String(Date.now()));
  } catch {
    // Storage unavailable (private mode, blocked site data); the ref still guards this mount.
  }
}

function hasConsentBeenApplied(): boolean {
  return (window.dataLayer ?? []).some(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      (entry as { event?: unknown }).event === CONSENT_EVENT
  );
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
    const isDone = () => pushedOrder.current === orderId || wasPurchasePushed(orderId);
    if (isDone()) return;

    // The consent path and the timeout fallback both end here, so the guard runs once per order.
    const pushPurchase = () => {
      if (isDone()) return;
      pushedOrder.current = orderId;
      markPurchasePushed(orderId);

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
    };

    if (hasConsentBeenApplied()) {
      pushPurchase();
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      if (hasConsentBeenApplied() || Date.now() - startedAt >= CONSENT_WAIT_MS) {
        stopWaiting();
        pushPurchase();
      }
    }, CONSENT_POLL_MS);
    // Never lose the purchase if the customer leaves before consent is applied.
    const onPageHide = () => {
      stopWaiting();
      pushPurchase();
    };
    window.addEventListener("pagehide", onPageHide);

    function stopWaiting() {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", onPageHide);
    }

    return stopWaiting;
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
