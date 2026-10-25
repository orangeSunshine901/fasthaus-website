export const GIFT_OFFER_DELAY_MS = 45_000;

export function isGiftOfferRoute(pathname: string) {
  return pathname === "/" || pathname === "/cart" || /^\/(collection|product)(\/[^/]+)?\/?$/.test(pathname);
}

export function shouldShowGiftOffer({
  activeMs,
  viewedLamp,
  hasLampInCart,
  pathname,
  dismissed,
  blocked,
}: {
  activeMs: number;
  viewedLamp: boolean;
  hasLampInCart: boolean;
  pathname: string;
  dismissed: boolean;
  blocked: boolean;
}) {
  return activeMs >= GIFT_OFFER_DELAY_MS
    && (viewedLamp || hasLampInCart)
    && isGiftOfferRoute(pathname)
    && !dismissed
    && !blocked;
}
