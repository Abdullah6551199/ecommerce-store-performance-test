import { NextRequest, NextResponse } from "next/server";
import {
  getAdminOrderById,
  updateAdminOrderStatus,
  updateOrderStatusSchema,
} from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await getAdminOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Admin fetch order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load order",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parseResult = updateOrderStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status value",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const updated = await updateAdminOrderStatus(id, parseResult.data.status);

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Order status updated to "${parseResult.data.status}"`,
    });
  } catch (error) {
    console.error("Admin update order status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update status",
      },
      { status: 500 }
    );
  }
}
