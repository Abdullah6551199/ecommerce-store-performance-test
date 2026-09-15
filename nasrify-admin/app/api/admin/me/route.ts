import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}
