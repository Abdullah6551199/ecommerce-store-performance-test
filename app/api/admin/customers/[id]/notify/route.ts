import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { createCustomerNotification } from "@/lib/customer-notifications";
import { getDb, customers } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const notifySchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  message: z.string().trim().min(1, "Message is required"),
  link: z.string().trim().optional().nullable(),
});

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: customerId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const parseResult = notifySchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid notification payload" },
        { status: 400 }
      );
    }

    const { title, message, link } = parseResult.data;
    const db = getDb();

    // Verify customer exists
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
    }

    const record = await createCustomerNotification({
      customerId,
      type: "custom",
      title,
      message,
      link: link || null,
    });

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
      notification: record,
    });
  } catch (error) {
    console.error("[AdminCustomerNotify] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
