"use client";

import { useEffect, useState } from "react";
import { qualifiesForReturningOffer, REACTIVATION_IDLE_MS, RETURN_VISIT_GAP_MS } from "@/lib/returning-offer";

const LAST_ACTIVE_KEY = "fasthaus_last_active";
const QUALIFIED_KEY = "fasthaus_returning_discount_qualified";

export default function useReturningDiscount(enabled: boolean) {
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let lastActivity = Date.now();
    let lastSaved = 0;
    let unlocked = false;
    let returning = false;
    try {
      returning = sessionStorage.getItem(QUALIFIED_KEY) === "1"
        || qualifiesForReturningOffer(Number(localStorage.getItem(LAST_ACTIVE_KEY)), lastActivity, RETURN_VISIT_GAP_MS);
    } catch {
      // In-page reactivation still works when storage is unavailable.
    }

    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      setEligible(true);
      try {
        sessionStorage.setItem(QUALIFIED_KEY, "1");
      } catch {
        // Keep this offer available in memory.
      }
    };
    const saveActivity = () => {
      try {
        localStorage.setItem(LAST_ACTIVE_KEY, String(lastActivity));
      } catch {
        // Return-visit recognition is best effort; the code still works at checkout.
      }
    };
    const recordActivity = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (qualifiesForReturningOffer(lastActivity, now, REACTIVATION_IDLE_MS)) unlock();
      lastActivity = now;
      if (now - lastSaved >= 10_000) {
        saveActivity();
        lastSaved = now;
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") recordActivity();
      else saveActivity();
    };
    const frame = window.requestAnimationFrame(() => {
      if (returning) unlock();
      recordActivity();
    });
    window.addEventListener("pointerdown", recordActivity, { passive: true });
    window.addEventListener("keydown", recordActivity);
    window.addEventListener("scroll", recordActivity, { passive: true });
    window.addEventListener("pagehide", saveActivity);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointerdown", recordActivity);
      window.removeEventListener("keydown", recordActivity);
      window.removeEventListener("scroll", recordActivity);
      window.removeEventListener("pagehide", saveActivity);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled]);

  return eligible;
}
