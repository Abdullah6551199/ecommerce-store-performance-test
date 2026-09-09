import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin, verifyPassword, updateAdminPassword } from "@/lib/auth";
import { getDb, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters long"),
});

/**
 * POST /api/admin/change-password
 * Allows authenticated admin to securely update their password in Cloudflare D1.
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
    const parseResult = changePasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parseResult.data;

    // Fetch latest user record to verify current password
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

    // Fallback if passwordHash was not populated in session
    if (!currentHash && admin.email === "admin@example.com") {
      currentHash = "$2b$10$ObV9nwqz.wYdS.Hmck6J.eeeIbGm1jfR8Cu7WsVksjJKSwgfyH6kC";
    }

    const isValidCurrent = await verifyPassword(currentPassword, currentHash);
    if (!isValidCurrent) {
      return NextResponse.json(
        { success: false, error: "Current password does not match" },
        { status: 400 }
      );
    }

    const updated = await updateAdminPassword(admin.id, newPassword);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update password in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin password updated successfully.",
    });
  } catch (error) {
    console.error("[Change Password Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
