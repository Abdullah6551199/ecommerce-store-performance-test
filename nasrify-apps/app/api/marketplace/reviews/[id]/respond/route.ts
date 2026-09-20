import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { respondAsTeam } from "@/lib/marketplace/reviews";
import { getAuthenticatedMarketplaceUser } from "@/lib/marketplace/auth";

export const dynamic = "force-dynamic";

const respondSchema = z.object({
  response: z.string().min(1, "Response cannot be empty").max(1000, "Response cannot exceed 1000 characters"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedMarketplaceUser(req);

    if (!user || !user.isTeam) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Nasrify Team access required" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = respondSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid response text" },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = await respondAsTeam(db, id, parseResult.data.response);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to post team response" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
