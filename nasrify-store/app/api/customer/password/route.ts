import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentCustomer,
  verifyCustomerPassword,
  hashCustomerPassword,
} from "@/lib/customer-auth";
import { getDb, customers } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export async function PUT(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = changePasswordSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid password data" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parseResult.data;

    // Verify current password
    const valid = await verifyCustomerPassword(currentPassword, customer.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const newHash = await hashCustomerPassword(newPassword);
    const db = getDb();
    const nowStr = new Date().toISOString();

    if (db) {
      await db
        .update(customers)
        .set({
          passwordHash: newHash,
          updatedAt: nowStr,
        })
        .where(eq(customers.id, customer.id));
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("[CustomerPassword] Error:", error);
    return NextResponse.json(
      { error: "Internal server error while changing password" },
      { status: 500 }
    );
  }
}
