import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getMyDownloads } from "@/apps/digital-products/lib/downloads";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    const { searchParams } = req.nextUrl;
    const emailParam = searchParams.get("email");

    // Use customer session email if authenticated, or emailParam if customer matches
    const targetEmail = customer?.email || emailParam;

    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: "Please sign in to view your digital downloads." },
        { status: 401 }
      );
    }

    const downloads = await getMyDownloads(targetEmail);

    return NextResponse.json({
      success: true,
      downloads,
      count: downloads.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch customer downloads." },
      { status: 500 }
    );
  }
}
