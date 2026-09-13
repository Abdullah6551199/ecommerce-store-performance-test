import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession, SESSION_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/logout
 * Destroys session in D1 and clears the HTTP-only admin_session cookie.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await destroySession(token);
    }

    cookieStore.delete(SESSION_COOKIE_NAME);

    const response = NextResponse.json({
      success: true,
      redirect: "/admin/login",
    });

    response.cookies.set(SESSION_COOKIE_NAME, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("[Logout Error]:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
