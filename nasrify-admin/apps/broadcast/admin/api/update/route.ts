import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { updateAdminBroadcast } from "@/apps/broadcast/lib/broadcasts";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as any;
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Broadcast ID is required." },
        { status: 400 }
      );
    }

    const updated = await updateAdminBroadcast(id, updateData);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Broadcast not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      broadcast: updated,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update broadcast",
      },
      { status: 500 }
    );
  }
}
