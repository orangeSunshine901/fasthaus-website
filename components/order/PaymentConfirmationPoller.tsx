"use client";

import { useEffect, useState } from "react";
import { CircleX } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { getPaymentConfirmationDeadline } from "@/lib/payment/geidea-client";

export default function PaymentConfirmationPoller({
  orderNumber,
  sessionExpiresAt,
}: {
  orderNumber: string;
  sessionExpiresAt: string | null;
}) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const deadline = getPaymentConfirmationDeadline(sessionExpiresAt);
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      const timeout = window.setTimeout(() => setTimedOut(true), 0);
      return () => window.clearTimeout(timeout);
    }

    const interval = window.setInterval(() => router.refresh(), 2_500);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setTimedOut(true);
    }, remaining);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [router, sessionExpiresAt]);

  return (
    <>
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full border-2"
        style={{
          borderColor: timedOut ? "var(--color-error)" : "var(--color-accent-amber)",
        }}
      >
        {timedOut ? (
          <CircleX size={26} style={{ color: "var(--color-error)" }} />
        ) : (
          <Spinner className="size-6 text-[var(--color-accent-amber)]" />
        )}
      </span>
      <p className="type-caption-sm">Order #{orderNumber}</p>
      <h1 className="type-display-xl">
        {timedOut ? "Payment not completed" : "Payment is being confirmed"}
      </h1>
      <p className="type-body-md" style={{ color: "var(--color-text-secondary)" }}>
        {timedOut
          ? "We couldn’t confirm this payment. If you were charged, check the status again or contact us with your order number."
          : "We’ll confirm this order only after the payment provider verifies the payment."}
      </p>
      {timedOut && (
        <button type="button" onClick={() => router.refresh()} className="btn-text">
          Check payment status
        </button>
      )}
    </>
  );
}
