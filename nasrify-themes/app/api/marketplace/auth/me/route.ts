import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedMarketplaceUser } from "@/lib/marketplace/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedMarketplaceUser(req);
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to get user profile" },
      { status: 500 }
    );
  }
}
