import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Config-level redirects return real 3xx responses. Redirecting from a statically prerendered
  // page instead served a 200 with a meta refresh, which search engines treat as a soft redirect.
  async redirects() {
    return [
      { source: "/shipping-returns", destination: "/legal/shipping", permanent: true },
      { source: "/warranty", destination: "/legal/warranty", permanent: true },
      { source: "/legal", destination: "/legal/terms", permanent: false },
    ];
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
