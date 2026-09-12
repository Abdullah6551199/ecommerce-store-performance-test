import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getCurrentCustomer,
  verifyCustomerPassword,
  CUSTOMER_SESSION_COOKIE,
} from "@/lib/customer-auth";
import { getDb, customers, orders } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const deleteAccountSchema = z.object({
  confirmationPassword: z.string().min(1, "Confirmation password is required"),
});

export async function DELETE(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = deleteAccountSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Please enter your password to confirm account deletion" },
        { status: 400 }
      );
    }

    const { confirmationPassword } = parseResult.data;
    const valid = await verifyCustomerPassword(confirmationPassword, customer.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect password. Account deletion aborted." },
        { status: 403 }
      );
    }

    const db = getDb();
    if (db) {
      // Unlink customer from orders so order records remain for store auditing
      await db
        .update(orders)
        .set({ customerId: null })
        .where(eq(orders.customerId, customer.id));

      // Delete customer record (cascades sessions, addresses, notifications, wishlist)
      await db.delete(customers).where(eq(customers.id, customer.id));
    }

    // Clear session cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: CUSTOMER_SESSION_COOKIE,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Your account has been deleted permanently",
    });
  } catch (error) {
    console.error("[DeleteAccount] Error:", error);
    return NextResponse.json(
      { error: "Internal server error during account deletion" },
      { status: 500 }
    );
  }
}
