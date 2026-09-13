import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/auth";

export const config = {
  matcher: [
    "/admin",
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
 * - Protects `/admin`, `/admin/*`, and `/api/admin/*`
 * - Strictly verifies `admin_session` token against D1 and verifies admin role
 * - Injects strict no-cache/no-store headers for sensitive routes
 */
export async function middleware(request: NextRequest) {
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

  // Check for presence of admin session cookie (strictly ignore customer_session)
  const sessionCookie = request.cookies.get("admin_session");
  const token = sessionCookie?.value?.trim();

  if (!token) {
    if (pathname.startsWith("/api/admin")) {
      return addNoStoreHeaders(
        NextResponse.json(
          { success: false, error: "Unauthorized. Admin session required." },
          { status: 401 }
        )
      );
    }

    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin" && pathname !== "/admin/dashboard") {
      loginUrl.searchParams.set("from", pathname);
    }
    return addNoStoreHeaders(NextResponse.redirect(loginUrl));
  }

  // Validate session token and admin role in D1
  const isValidAdmin = await verifyAdminSessionToken(token).catch(() => false);

  if (!isValidAdmin) {
    if (pathname.startsWith("/api/admin")) {
      const response = NextResponse.json(
        { success: false, error: "Unauthorized. Invalid or expired admin session." },
        { status: 401 }
      );
      response.cookies.set("admin_session", "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
      });
      return addNoStoreHeaders(response);
    }

    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin" && pathname !== "/admin/dashboard") {
      loginUrl.searchParams.set("from", pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("admin_session", "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
    });
    return addNoStoreHeaders(response);
  }

  return addNoStoreHeaders(NextResponse.next());
}


