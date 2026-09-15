import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  destroyCustomerSession,
  CUSTOMER_SESSION_COOKIE,
} from "@/lib/customer-auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;

    if (token) {
      await destroyCustomerSession(token);
    }

    // Delete session cookie
    cookieStore.set({
      name: CUSTOMER_SESSION_COOKIE,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("[Logout] Error:", error);
    return NextResponse.json(
      { error: "Internal server error during logout" },
      { status: 500 }
    );
  }
}
