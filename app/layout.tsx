import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import PageTransition from "@/components/layout/PageTransition";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import CartProvider from "@/components/cart/CartProvider";
import { Suspense } from "react";
import "locomotive-scroll/dist/locomotive-scroll.css";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
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
  description: "Minimal lighting & home goods. Fast to browse, clean to look at, effortless to buy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', system-ui, sans-serif)" }}>
        <Suspense fallback={<PageTransition>{children}</PageTransition>}>
          <AnalyticsProvider><CartProvider><PageTransition>{children}</PageTransition></CartProvider></AnalyticsProvider>
        </Suspense>
      </body>
    </html>
  );
}
