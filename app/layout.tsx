import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import PageTransition from "@/components/layout/PageTransition";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import SilktideConsentManager from "@/components/consent/SilktideConsentManager";
import CartProvider from "@/components/cart/CartProvider";
import HomeNavigationProvider from "@/components/navigation/HomeNavigationProvider";
import { getGeideaSdkUrl } from "@/lib/payment/geidea";
import { Suspense } from "react";
import "locomotive-scroll/dist/locomotive-scroll.css";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const golftenStamp = localFont({
  src: "../fonts/Golften-Stamp.otf",
  variable: "--font-golften-stamp-source",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  title: "Fasthaus — Modern Lamps, Made to Glow Differently",
  description:
    "Minimal lighting & home goods. Fast to browse, clean to look at, effortless to buy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${golftenStamp.variable} h-full antialiased`}
    >
      <head>
        {/* Silktide ships as a standalone stylesheet rather than an importable CSS module. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link
          rel="stylesheet"
          id="silktide-consent-manager-css"
          href="/silktide-consent-manager.css"
        />
        <style id="silktide-consent-manager-overrides">{`
          #stcm-wrapper {
            --boxShadow: -5px 5px 10px 0px #00000012, 0px 0px 50px 0px #0000001a;
            --fontFamily: var(--font-dm-sans), "DM Sans", system-ui, sans-serif;
            --primaryColor: #ff4b1f;
            --backgroundColor: #f8f6f3;
            --textColor: #4b494b;
            --backdropBackgroundColor: #00000033;
            --backdropBackgroundBlur: 0px;
            --iconColor: #ff4b1f;
            --iconBackgroundColor: #f8f6f3;
          }

          #stcm-icon {
            display: none !important;
          }
        `}</style>
        <Script id="google-consent-default" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          window.gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted'
          });
        `}</Script>
        <Script id="geidea-checkout-sdk" src={getGeideaSdkUrl()} strategy="beforeInteractive" />
        <meta
          name="google-site-verification"
          content="6oZVZ4_UZrObrRTiXbYTEg09M59D1JglTLxwXzB89Hg"
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', system-ui, sans-serif)" }}
      >
        <SilktideConsentManager />
        <HomeNavigationProvider>
          <Suspense fallback={<PageTransition>{children}</PageTransition>}>
            <AnalyticsProvider>
              <CartProvider>
                <PageTransition>{children}</PageTransition>
              </CartProvider>
            </AnalyticsProvider>
          </Suspense>
        </HomeNavigationProvider>
      </body>
    </html>
  );
}
