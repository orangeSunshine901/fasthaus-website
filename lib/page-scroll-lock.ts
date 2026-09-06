export const PAGE_SCROLL_LOCK_EVENT = "fasthaus:page-scroll-lock-change";

type ScrollLockSource = "cart" | "cookie-consent" | "mobile-menu";

const sourceClass = (source: ScrollLockSource) => `${source}-scroll-locked`;
const SOURCE_SELECTOR =
  ".cart-scroll-locked,.cookie-consent-scroll-locked,.mobile-menu-scroll-locked";

export function isPageScrollLocked() {
  return document.documentElement.classList.contains("page-scroll-locked");
}

export function setPageScrollLocked(source: ScrollLockSource, locked: boolean) {
  const root = document.documentElement;
  const wasLocked = isPageScrollLocked();

  root.classList.toggle(sourceClass(source), locked);
  const isLocked = root.matches(SOURCE_SELECTOR);

  if (isLocked && !wasLocked) {
    root.dataset.scrollLockY = String(window.scrollY);
    root.style.setProperty("--page-scroll-lock-top", `${-window.scrollY}px`);
  }

  root.classList.toggle("page-scroll-locked", isLocked);

  if (!isLocked && wasLocked) {
    const scrollY = Number(root.dataset.scrollLockY ?? 0);
    delete root.dataset.scrollLockY;
    root.style.removeProperty("--page-scroll-lock-top");
    // Restoration must finish before consumers handle the unlock event.
    // The site's CSS scroll-behavior would otherwise animate this jump.
    window.scrollTo({ top: scrollY, behavior: "instant" });
  }

  window.dispatchEvent(new Event(PAGE_SCROLL_LOCK_EVENT));
}
