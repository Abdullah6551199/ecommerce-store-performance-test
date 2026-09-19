import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { listTrustBadges, listPaymentIcons } from "@/apps/trust-badges/lib/trust-badges";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "payment-icons") {
      const icons = await listPaymentIcons(false);
      return NextResponse.json({ success: true, data: icons });
    }

    const badges = await listTrustBadges({ isActiveOnly: false });
    return NextResponse.json({ success: true, data: badges });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch trust badges",
      },
      { status: 500 }
    );
  }
}
