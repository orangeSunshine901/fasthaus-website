"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isPageScrollLocked } from "@/lib/page-scroll-lock";
import { useCartStore } from "@/lib/store/cart";
import styles from "./DesignWeekPopup.module.css";

const MARKET_CLOSE = Date.parse("2026-11-08T22:00:00+04:00");
const SESSION_KEY = "fasthaus_ddw_2026_popup_seen";
const DIRECTIONS =
  "https://www.google.com/maps/dir/?api=1&destination=Dubai%20Design%20District%2C%20Dubai";
let shownInPage = false;

export default function DesignWeekPopup() {
  const [open, setOpen] = useState(false);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (shownInPage || Date.now() >= MARKET_CLOSE) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // In-memory state covers browsers that block session storage.
    }

    let readySince = 0;
    let timer: number;
    const showWhenReady = () => {
      const now = Date.now();
      if (now >= MARKET_CLOSE) return;

      const consentOpen = ["#stcm-banner", "#stcm-modal"].some((selector) =>
        Boolean(document.querySelector(selector)?.getClientRects().length)
      );
      const blocked =
        document.hidden ||
        consentOpen ||
        isPageScrollLocked() ||
        useCartStore.getState().drawerOpen ||
        document.documentElement.classList.contains("home-reveal-scroll-locked");

      if (blocked) readySince = 0;
      else readySince ||= now;

      if (!readySince || now - readySince < 2000) {
        timer = window.setTimeout(showWhenReady, 500);
        return;
      }

      shownInPage = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Keep the same visit quiet even without storage.
      }
      const focused = document.activeElement;
      previousFocus.current = focused instanceof HTMLElement ? focused : null;
      setOpen(true);
      timer = window.setTimeout(() => setOpen(false), MARKET_CLOSE - now);
    };

    timer = window.setTimeout(showWhenReady, 500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} data-lenis-prevent>
          <Dialog.Content
            className={styles.panel}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              previousFocus.current?.focus({ preventScroll: true });
            }}
          >
            <header className={styles.header}>
              <Dialog.Title className={styles.title}>Dubai Design Week Marketplace</Dialog.Title>
              <Dialog.Close className={styles.close} aria-label="Close Dubai Design Week pop-up">
                <X aria-hidden="true" size={22} />
              </Dialog.Close>
            </header>
            <Image
              className={styles.poster}
              src="/fasthaus-ddw-2026-booth-58.webp"
              alt=""
              width={1200}
              height={1200}
              sizes="(orientation: landscape) and (max-height: 640px) and (min-width: 512px) 50vw, (max-width: 536px) calc(100vw - 24px), 512px"
            />
            <div className={styles.details}>
              <Dialog.Description className={styles.copy}>
                <strong>Booth 58 at Dubai Design District</strong>
                <span>7–8 November · 10 am–10 pm</span>
              </Dialog.Description>
              <a
                className={`btn btn-secondary ${styles.directions}`}
                href={DIRECTIONS}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                Get directions <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
