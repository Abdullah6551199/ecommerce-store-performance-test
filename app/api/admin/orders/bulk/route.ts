import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateBulkAdminOrderStatus, ORDER_STATUSES } from "@/lib/orders";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const bulkUpdateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one order ID is required"),
  status: z.enum(ORDER_STATUSES),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        {
          status: 401,
          headers: { "Cache-Control": "private, no-store" },
        }
      );
    }

    const body = await req.json();
    const parseResult = bulkUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Invalid bulk update request",
        },
        {
          status: 400,
          headers: { "Cache-Control": "private, no-store" },
        }
      );
    }

    const { ids, status } = parseResult.data;
    const updatedCount = await updateBulkAdminOrderStatus(ids, status);

    return NextResponse.json(
      {
        success: true,
        data: {
          updatedCount,
          status,
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store" },
      }
    );
  } catch (error) {
    console.error("Admin bulk update orders error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to bulk update orders",
      },
      {
        status: 500,
        headers: { "Cache-Control": "private, no-store" },
      }
    );
  }
}
