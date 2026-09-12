import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, customers, customerSessions } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const statusSchema = z.object({
  status: z.enum(["active", "suspended"]),
});

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: customerId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const parseResult = statusSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'active' or 'suspended'" },
        { status: 400 }
      );
    }

    const { status } = parseResult.data;
    const db = getDb();
    const nowStr = new Date().toISOString();

    if (db) {
      const target = await db
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      if (target.length === 0) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }

      await db
        .update(customers)
        .set({ status, updatedAt: nowStr })
        .where(eq(customers.id, customerId));

      // If suspended, invalidate all active sessions immediately
      if (status === "suspended") {
        await db
          .delete(customerSessions)
          .where(eq(customerSessions.customerId, customerId));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Customer account marked as ${status}`,
      status,
    });
  } catch (error) {
    console.error("[AdminCustomerStatus] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
