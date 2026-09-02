"use client";

import { useEffect, useState } from "react";
import { createGeideaExpressCheckout } from "@/lib/payment/geidea-client";

const CONTAINER_ID = "geidea-express-checkout";

export default function GeideaExpressWallets({
  sessionId,
  orderId,
}: {
  sessionId: string;
  orderId: string;
}) {
  const [status, setStatus] = useState<{ sessionId: string; message: string } | null>(null);
  const isTestSession = sessionId.startsWith("test-geidea-session-");
  const message = isTestSession
    ? "Express wallets require a live Geidea session."
    : status?.sessionId === sessionId
      ? status.message
      : null;

  useEffect(() => {
    if (isTestSession) return;

    let cancelled = false;
    const container = document.getElementById(CONTAINER_ID);
    container?.replaceChildren();

    async function mountWallets() {
      try {
        const checkout = await createGeideaExpressCheckout(sessionId, {
          onSuccess() {
            window.location.assign(`/order/${orderId}`);
          },
          onError(data) {
            console.error("Geidea Express Checkout payment failed", data);
            const code = data.detailedResponseCode ?? data.responseCode;
            const detail =
              data.detailedResponseMessage ??
              data.responseMessage ??
              "The wallet payment could not be completed. Please try again.";
            setStatus({ sessionId, message: code ? `${detail} (${code})` : detail });
          },
          onCancel() {
            setStatus({ sessionId, message: "Wallet payment cancelled. No charge was made." });
          },
        });
        if (!cancelled) checkout.mount(`#${CONTAINER_ID}`);
      } catch (error) {
        if (!cancelled) {
          console.error("Could not initialize Geidea Express Checkout", error);
          setStatus({
            sessionId,
            message: "Express wallets could not be initialized. You can still pay by card.",
          });
        }
      }
    }

    void mountWallets();
    return () => {
      cancelled = true;
      container?.replaceChildren();
    };
  }, [isTestSession, orderId, sessionId]);

  return (
    <div className="flex flex-col gap-2.5">
      <div id={CONTAINER_ID} className="min-h-[60px] w-full" />
      {message && (
        <p
          role="status"
          className="type-caption-sm text-center"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
