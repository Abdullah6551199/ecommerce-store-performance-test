import { NextResponse } from "next/server";
import { listHomepageSections } from "@/lib/homepage";

export const dynamic = "force-dynamic";

/**
 * GET /api/homepage/sections
 * Public endpoint returning all active homepage sections ordered by sortOrder.
 */
export async function GET() {
  try {
    const sections = await listHomepageSections({ activeOnly: true });
    return NextResponse.json(
      {
        success: true,
        data: sections,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/homepage/sections] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load homepage sections." },
      { status: 500 }
    );
  }
}
