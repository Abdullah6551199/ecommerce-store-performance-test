import { NextResponse } from "next/server";
import { getNavigationPages } from "@/lib/cms";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const navigation = await getNavigationPages();
    return NextResponse.json({
      success: true,
      data: navigation,
    });
  } catch (error: any) {
    console.error("[GET /api/pages/navigation] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch navigation items." },
      { status: 500 }
    );
  }
}
