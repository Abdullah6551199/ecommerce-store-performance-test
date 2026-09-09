import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

/**
 * Next.js Edge Middleware for Admin Route Protection
 * - Intercepts all `/admin/*` pages and `/api/admin/*` endpoints
 * - Permits public access to `/admin/login` and `/api/admin/login`
 * - Returns 401 JSON for unauthenticated API requests
 * - Redirects unauthenticated page visitors immediately to `/admin/login`
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow unrestricted access to the admin login page and login endpoint
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/api/admin/login"
  ) {
    return NextResponse.next();
  }

  // Check for presence of admin session cookie
  const sessionCookie = request.cookies.get("admin_session");

  if (!sessionCookie || !sessionCookie.value) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

