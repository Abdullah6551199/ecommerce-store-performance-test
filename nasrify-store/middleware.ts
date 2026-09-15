import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/cart",
    "/checkout",
    "/api/cart/:path*",
    "/api/orders/:path*",
  ],
};

function addNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, max-age=0, must-revalidate"
  );
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Cloudflare-CDN-Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

/**
 * Next.js Edge Middleware for Storefront Private Route Cache Bypass
 * - Injects strict no-cache/no-store headers for cart, checkout, and order APIs
 */
export async function middleware(request: NextRequest) {
  return addNoStoreHeaders(NextResponse.next());
}
