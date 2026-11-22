"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, X } from "lucide-react";
import { isPageScrollLocked } from "@/lib/page-scroll-lock";
import { useCartStore } from "@/lib/store/cart";
import { AFTER_HOURS_DELAY_MS, AFTER_HOURS_SESSION_KEY, AFTER_HOURS_TIME_KEY, isAfterHoursInvitationRoute } from "@/lib/after-hours";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";
import styles from "./AfterHours.module.css";

export default function AfterHoursInvitation() {
  const pathname = usePathname();
  const drawerOpen = useCartStore((state) => state.drawerOpen);
  const elapsed = useRef(0);
  const seen = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      seen.current ||= sessionStorage.getItem(AFTER_HOURS_SESSION_KEY) === "1";
      elapsed.current = Math.max(elapsed.current, Number(sessionStorage.getItem(AFTER_HOURS_TIME_KEY)) || 0);
    } catch {
      // Keep timing and dismissal in memory if storage is unavailable.
    }
    let lastTick = performance.now();
    const update = () => {
      const now = performance.now();
      const blocked = document.hidden || isPageScrollLocked() || useCartStore.getState().drawerOpen
        || document.documentElement.classList.contains("home-reveal-scroll-locked")
        || !isAfterHoursInvitationRoute(pathname)
        || ["#stcm-banner", "#stcm-modal", '[aria-label="Returning visitor offer"]', '[aria-label="Complimentary gift offer"]']
          .some((selector) => Boolean(document.querySelector(selector)?.getClientRects().length));
      if (!blocked && !seen.current) elapsed.current += Math.min(now - lastTick, 1500);
      lastTick = now;
      try { sessionStorage.setItem(AFTER_HOURS_TIME_KEY, String(elapsed.current)); } catch {}
      if (blocked) {
        setVisible(false);
        return;
      }
      if (seen.current || elapsed.current < AFTER_HOURS_DELAY_MS) return;
      seen.current = true;
      try { sessionStorage.setItem(AFTER_HOURS_SESSION_KEY, "1"); } catch {}
      setVisible(true);
      capture(analyticsEvents.afterHoursInvitationShown, { source_path: pathname });
    };
    const timer = window.setInterval(update, 1000);
    const pause = () => { lastTick = performance.now(); update(); };
    document.addEventListener("visibilitychange", pause);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", pause);
      try { sessionStorage.setItem(AFTER_HOURS_TIME_KEY, String(elapsed.current)); } catch {}
    };
  }, [pathname]);

  if (!visible || drawerOpen || !isAfterHoursInvitationRoute(pathname)) return null;

  const dismiss = (method: string) => {
    capture(analyticsEvents.afterHoursInvitationDismissed, { method, source_path: pathname });
    setVisible(false);
  };

  return (
    <aside className={styles.invitation} aria-label="After Hours game invitation" onKeyDown={(event) => {
      if (event.key === "Escape") dismiss("escape");
    }}>
      <button className={styles.close} onClick={() => dismiss("close")} aria-label="Dismiss game invitation"><X size={20} aria-hidden="true" /></button>
      <h2>Still here? So are the lamps.</h2>
      <p>Step into After Hours, a short game about the stories behind four Fasthaus lights.</p>
      <a href="/after-hours?entry=invitation" className={styles.invitationLink} onClick={() => capture(analyticsEvents.afterHoursInvitationClicked, { source_path: pathname })}>Play After Hours <ArrowUpRight size={18} aria-hidden="true" /></a>
    </aside>
  );
}
