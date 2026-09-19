import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { listTrustBadges, createTrustBadge } from "@/lib/trust-badges";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const badges = await listTrustBadges({ isActiveOnly: false });
    return NextResponse.json({ success: true, data: badges, count: badges.length });
  } catch (error) {
    console.error("GET /api/admin/trust-badges error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch trust badges" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as any;
    if (!body.title || !body.icon) {
      return NextResponse.json(
        { success: false, error: "Title and icon are required" },
        { status: 400 }
      );
    }

    const badge = await createTrustBadge({
      icon: body.icon,
      title: body.title,
      description: body.description || null,
      location: body.location || "all",
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json({ success: true, data: badge }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/trust-badges error:", error);
    return NextResponse.json({ success: false, error: "Failed to create trust badge" }, { status: 500 });
  }
}
