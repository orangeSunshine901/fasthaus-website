import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return [
      {
        source: "/site-preferences.js",
        destination: "/silktide-consent-manager.js",
      },
      {
        source: "/site-preferences.css",
        destination: "/silktide-consent-manager.css",
      },
    ];
  },
};

export default nextConfig;
