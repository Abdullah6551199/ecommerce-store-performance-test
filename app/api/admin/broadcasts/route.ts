import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  listAdminBroadcasts,
  createAdminBroadcast,
  type CreateBroadcastInput,
} from "@/lib/broadcasts";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/broadcasts - List all broadcasts with stats
 */
export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const broadcasts = await listAdminBroadcasts();
    return NextResponse.json({ success: true, broadcasts });
  } catch (err) {
    console.error("[GET /api/admin/broadcasts] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to list broadcasts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/broadcasts - Create and dispatch a new broadcast
 */
export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Partial<CreateBroadcastInput>;

    if (!body.title || typeof body.title !== "string" || body.title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Title is required (minimum 2 characters)" },
        { status: 400 }
      );
    }

    if (!body.message || typeof body.message !== "string" || body.message.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Message is required (minimum 2 characters)" },
        { status: 400 }
      );
    }

    const validTypes = ["info", "promotion", "announcement", "warning"];
    const type = validTypes.includes(body.type || "") ? body.type : "info";

    const validTargets = ["all", "registered", "guest"];
    const target = validTargets.includes(body.target || "") ? body.target : "all";

    const broadcast = await createAdminBroadcast(
      {
        title: body.title.trim(),
        message: body.message.trim(),
        imageUrl: body.imageUrl?.trim() || null,
        linkUrl: body.linkUrl?.trim() || null,
        buttonText: body.buttonText?.trim() || null,
        type,
        target,
        scheduledFor: body.scheduledFor || null,
      },
      admin.email || "Store Admin"
    );

    return NextResponse.json({
      success: true,
      broadcast,
      message: "Broadcast notification dispatched successfully!",
    });
  } catch (err) {
    console.error("[POST /api/admin/broadcasts] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create broadcast" },
      { status: 500 }
    );
  }
}
