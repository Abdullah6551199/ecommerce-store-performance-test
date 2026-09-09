import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

/**
 * Next.js Edge Middleware for Admin Route Protection
 * - Intercepts all `/admin/*` routes
 * - Permits public access to `/admin/login`
 * - Redirects unauthenticated visitors immediately to `/admin/login`
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow unrestricted access to the admin login page
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    // If already authenticated and visiting login, optionally continue or allow
    return NextResponse.next();
  }

  // Check for presence of admin session cookie
  const sessionCookie = request.cookies.get("admin_session");

  if (!sessionCookie || !sessionCookie.value) {
    const loginUrl = new URL("/admin/login", request.url);
    // Optional: attach returnUrl if needed in future
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
