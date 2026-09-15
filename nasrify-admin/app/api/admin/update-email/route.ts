import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin, verifyPassword, updateAdminEmail } from "@/lib/auth";
import { getDb, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const updateEmailSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newEmail: z.string().email("Please enter a valid email address"),
});

/**
 * POST /api/admin/update-email
 * Allows authenticated admin to securely update their email address in the database.
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
    const parseResult = updateEmailSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { currentPassword, newEmail } = parseResult.data;
    const normalizedNewEmail = newEmail.toLowerCase().trim();

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

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, currentHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Current password does not match." },
        { status: 400 }
      );
    }

    // Check if new email is already in use by another user
    if (db) {
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedNewEmail))
        .limit(1);

      if (existingUsers.length > 0 && existingUsers[0].id !== admin.id) {
        return NextResponse.json(
          { success: false, error: "This email is already associated with another account." },
          { status: 400 }
        );
      }
    }

    // Update email in database
    const success = await updateAdminEmail(admin.id, normalizedNewEmail);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to update email in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin email updated successfully.",
      email: normalizedNewEmail,
    });
  } catch (error) {
    console.error("[Update Admin Email Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
