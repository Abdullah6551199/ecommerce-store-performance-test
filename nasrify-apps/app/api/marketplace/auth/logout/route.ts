import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("customer_session", "", {
    path: "/",
    maxAge: 0,
  });
  cookieStore.set("admin_session", "", {
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ success: true });
}
