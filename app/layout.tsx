import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "locomotive-scroll/dist/locomotive-scroll.css";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

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
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', system-ui, sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
