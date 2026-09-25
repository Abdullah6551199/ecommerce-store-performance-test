import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { matchEdgeCache } from "@/lib/edge-cache";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static chunks)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - api/media (R2 media assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/media).*)",
  ],
};

const PRIVATE_PATHS = [
  "/cart",
  "/checkout",
  "/account",
  "/wishlist",
  "/order-success",
  "/track-order",
  "/api/cart",
  "/api/orders",
  "/api/customer",
  "/api/auth",
];

const PUBLIC_CACHEABLE_PATHS = [
  "/",
  "/shop",
  "/product",
  "/category",
  "/about",
  "/contact",
  "/faq",
  "/privacy-policy",
  "/terms",
  "/cookie-policy",
];

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublicCacheableRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_CACHEABLE_PATHS.some((p) => p !== "/" && (pathname === p || pathname.startsWith(`${p}/`)));
}

function addNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Cloudflare-CDN-Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Cache-Status", "BYPASS");
  return response;
}

/**
 * Next.js Edge Middleware for Storefront Edge Cache & Route Protection (Stage F0.5d)
 * 1. Serves public GET HTML pages directly from Cloudflare Cache API (caches.default) in <2ms CPU.
 * 2. Injects strict no-cache/no-store headers for private user routes.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Theme preview mode: strictly bypass edge cache and pass preview header
  const previewTheme = request.nextUrl.searchParams.get("preview_theme");
  if (previewTheme) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-preview-theme", previewTheme);
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return addNoStoreHeaders(response);
  }

  // 1. Private routes: strictly bypass cache and forbid CDN storage
  if (isPrivateRoute(pathname)) {
    return addNoStoreHeaders(NextResponse.next());
  }

  // 2. Public HTML cacheable routes on GET
  if (request.method === "GET" && isPublicCacheableRoute(pathname)) {
    // Attempt instant Edge Cache match (<2ms CPU)
    try {
      const cached = await matchEdgeCache(request);
      if (cached) {
        return cached;
      }
    } catch (_err) {
      // Non-fatal, continue downstream to SSR
    }

    // Pass downstream with MISS status indicator
    const response = NextResponse.next();
    response.headers.set("X-Cache-Status", "MISS");
    return response;
  }

  return NextResponse.next();
}
