import { readSilktideMarketingConsent } from "../consent/silktide.ts";
import { metaCookie, type MetaAttribution } from "./meta-shared.ts";

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push?: Fbq;
  loaded?: boolean;
  version?: string;
  disablePushState?: boolean;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let initializedPixel: string | null = null;
let lastPageView: string | null = null;
const SCRIPT_ID = "fasthaus-meta-pixel";

export function isStorefrontMetaPage(pathname: string): boolean {
  return pathname === "/" || /^\/(?:collection(?:\/[^/]+)?|product\/[^/]+)\/?$/.test(pathname);
}

export function metaPixelId(): string | null {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  return id && /^\d+$/.test(id) ? id : null;
}

function cookie(name: string): string | undefined {
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function captureClickId() {
  const fbclid = new URL(window.location.href).searchParams.get("fbclid");
  if (!fbclid || !/^[A-Za-z0-9_-]{1,800}$/.test(fbclid)) return;
  const existing = metaCookie(cookie("_fbc"), "fbc");
  if (existing?.endsWith(`.${fbclid}`)) return;
  document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; Path=/; Max-Age=7776000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
}

function ensurePixel(): Fbq | null {
  const id = metaPixelId();
  if (
    !id ||
    typeof window === "undefined" ||
    !isStorefrontMetaPage(window.location.pathname) ||
    readSilktideMarketingConsent() !== "granted"
  )
    return null;

  if (!window.fbq) {
    const fbq: Fbq = Object.assign(
      (...args: unknown[]) => {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
      },
      { queue: [] as unknown[][], loaded: true, version: "2.0", disablePushState: true }
    );
    fbq.push = fbq;
    window.fbq = fbq;
    window._fbq = fbq;
  }
  const fbq = window.fbq;
  captureClickId();
  if (!fbq.callMethod) {
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      // Recheck the current route and consent after the asynchronous script load.
      script.onload = () => trackMetaPageView();
      script.onerror = () => script.remove();
      document.head.appendChild(script);
    }
    return null;
  }
  fbq("consent", "grant");
  if (initializedPixel !== id) {
    fbq("set", "autoConfig", false, id);
    fbq("init", id);
    initializedPixel = id;
  }
  return fbq;
}

export function trackMetaPageView(): boolean {
  try {
    const fbq = ensurePixel();
    if (!fbq) return false;
    const page = window.location.href;
    if (lastPageView !== page) {
      fbq("trackSingle", metaPixelId(), "PageView");
      lastPageView = page;
    }
    return true;
  } catch {
    // A blocked advertising script must never interrupt shopping or payment.
    return false;
  }
}

export function metaCheckoutAttribution(): MetaAttribution {
  if (
    typeof window === "undefined" ||
    !metaPixelId() ||
    readSilktideMarketingConsent() !== "granted"
  )
    return { consent: false };
  captureClickId();
  return {
    consent: true,
    fbp: metaCookie(cookie("_fbp"), "fbp"),
    fbc: metaCookie(cookie("_fbc"), "fbc"),
  };
}

export function suspendMetaPixel() {
  lastPageView = null;
  if (window.fbq?.callMethod) window.fbq("consent", "revoke");
}

export function revokeMetaConsent() {
  suspendMetaPixel();
  const hostname = window.location.hostname;
  const domains = [
    "",
    `; Domain=${hostname}`,
    ...(hostname.endsWith(".fasthaus.ae") ? ["; Domain=fasthaus.ae"] : []),
  ];
  for (const name of ["_fbp", "_fbc"]) {
    for (const domain of domains)
      document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${domain}`;
  }
}
