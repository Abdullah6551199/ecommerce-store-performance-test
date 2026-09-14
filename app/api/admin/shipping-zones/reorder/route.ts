import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, shippingZones } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { memoryShippingZones } from "@/lib/shipping";

export const dynamic = "force-dynamic";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      sortOrder: z.coerce.number().int(),
    })
  ),
});

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { items } = reorderSchema.parse(body);

    const db = getDb();
    const now = new Date().toISOString();

    if (db) {
      for (const item of items) {
        await db
          .update(shippingZones)
          .set({ sortOrder: item.sortOrder, updatedAt: now })
          .where(eq(shippingZones.id, item.id));
      }
    } else {
      for (const item of items) {
        const found = memoryShippingZones.find((z) => z.id === item.id);
        if (found) {
          found.sortOrder = item.sortOrder;
          found.updatedAt = now;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Shipping zones reordered successfully",
    });
  } catch (error) {
    console.error("Failed to reorder shipping zones:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder shipping zones" },
      { status: 400 }
    );
  }
}
