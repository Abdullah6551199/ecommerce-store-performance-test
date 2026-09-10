import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
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
 * Next.js Edge Middleware for Admin Route Protection & Private Route Cache Bypass
 * - Protects `/admin/*` and `/api/admin/*`
 * - Injects strict no-cache/no-store headers for /cart, /checkout, /admin/*, /api/admin/*, /api/cart/*, /api/orders/*
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For cart, checkout, cart API, and orders API: allow through with strict no-store headers
  const isStorefrontPrivate =
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname.startsWith("/api/cart") ||
    pathname.startsWith("/api/orders");

  if (isStorefrontPrivate) {
    return addNoStoreHeaders(NextResponse.next());
  }

  // Admin routes: allow login page and login endpoint
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/api/admin/login"
  ) {
    return addNoStoreHeaders(NextResponse.next());
  }

  // Check for presence of admin session cookie
  const sessionCookie = request.cookies.get("admin_session");

  if (!sessionCookie || !sessionCookie.value) {
    if (pathname.startsWith("/api/admin")) {
      return addNoStoreHeaders(
        NextResponse.json(
          { success: false, error: "Unauthorized. Admin session required." },
          { status: 401 }
        )
      );
    }

    const loginUrl = new URL("/admin/login", request.url);
    return addNoStoreHeaders(NextResponse.redirect(loginUrl));
  }

  return addNoStoreHeaders(NextResponse.next());
}

