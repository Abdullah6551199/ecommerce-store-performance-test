import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ecommerce-store-perf-test.zia291930.workers.dev",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      // 1. Static Assets (1 year immutable edge and browser cache)
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // 2. R2 Media Assets (1 year immutable edge and browser cache)
      {
        source: "/api/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Vary",
            value: "Accept, Accept-Encoding",
          },
        ],
      },
      // 3. Public Storefront API Routes (60s edge cache, stale-while-revalidate 600s)
      {
        source: "/api/categories",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=600",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/api/homepage/sections",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=600",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/api/appearance",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=600",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/api/settings",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=600",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/api/products/search",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=600",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
        ],
      },
      // 4. HTML Storefront Pages (ISR 300s, Search 60s)
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=600",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/product/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=600",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/category/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=600",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/search",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=600",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=600",
          },
        ],
      },
      // 5. Dynamic / User-Specific Routes (Strict No-Store Cache Bypass)
      {
        source: "/cart",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/checkout",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/api/cart/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/api/orders/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
