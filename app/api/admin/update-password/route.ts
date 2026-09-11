import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin, verifyPassword, updateAdminPassword } from "@/lib/auth";
import { getDb, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * POST /api/admin/update-password
 * Securely updates an authenticated administrator's password in the database.
 */
export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = updatePasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parseResult.data;

    // Fetch user record to check current password
    const db = getDb();
    let currentHash = admin.passwordHash;

    if (db) {
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, admin.id))
        .limit(1);

      if (userRows.length > 0) {
        currentHash = userRows[0].passwordHash;
      }
    }

    // Fallback if hash was not loaded in session
    if (!currentHash && admin.email === "admin@example.com") {
      currentHash = "$2b$10$ObV9nwqz.wYdS.Hmck6J.eeeIbGm1jfR8Cu7WsVksjJKSwgfyH6kC";
    }

    // Verify current password against stored bcrypt hash
    const isValidCurrent = await verifyPassword(currentPassword, currentHash);
    if (!isValidCurrent) {
      return NextResponse.json(
        { success: false, error: "Current password does not match." },
        { status: 400 }
      );
    }

    // Update password in database (bcrypt 10 rounds handled in updateAdminPassword)
    const updated = await updateAdminPassword(admin.id, newPassword);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update password in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin password updated successfully.",
    });
  } catch (error) {
    console.error("[Update Admin Password Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
