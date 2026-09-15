import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllAdminOrders, ORDER_STATUSES } from "@/lib/orders";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  search: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const parseResult = querySchema.safeParse({
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const result = await getAllAdminOrders(parseResult.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Admin list orders error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

