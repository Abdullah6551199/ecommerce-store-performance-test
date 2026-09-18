import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { removeFromCustomerWishlist, getWishlistAppSettings } from "@/apps/wishlist/lib/wishlist";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parse = schema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const { productId } = parse.data;
    const customer = await getCurrentCustomer();

    if (customer) {
      const success = await removeFromCustomerWishlist(customer.id, productId);
      return NextResponse.json({
        success,
        inWishlist: false,
        message: success ? "Removed from wishlist" : "Failed to remove",
      });
    }

    // Guest wishlist removal
    const settings = await getWishlistAppSettings();
    if (settings.requireLogin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const guestCookie = req.cookies.get("guest_wishlist")?.value || "";
    let guestItems: string[] = [];
    try {
      if (guestCookie) {
        guestItems = JSON.parse(decodeURIComponent(guestCookie));
      }
    } catch {
      guestItems = [];
    }

    guestItems = guestItems.filter((id) => id !== productId);

    const res = NextResponse.json({
      success: true,
      inWishlist: false,
      message: "Removed from guest wishlist",
    });

    res.cookies.set("guest_wishlist", encodeURIComponent(JSON.stringify(guestItems)), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    console.error("[WishlistAPI:remove] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const DELETE = POST;
