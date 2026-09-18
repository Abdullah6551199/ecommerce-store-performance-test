import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { addToCustomerWishlist, getWishlistAppSettings } from "@/apps/wishlist/lib/wishlist";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

/**
 * POST /api/wishlist/add
 * Adds a product to the customer or guest wishlist.
 */
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
      const success = await addToCustomerWishlist(customer.id, productId);
      return NextResponse.json({
        success,
        inWishlist: true,
        message: success ? "Added to wishlist" : "Failed to add to wishlist",
      });
    }

    // Guest wishlist flow
    const settings = await getWishlistAppSettings();
    if (settings.requireLogin) {
      return NextResponse.json(
        { success: false, error: "Authentication required to persist wishlist to account" },
        { status: 401 }
      );
    }

    // Read existing guest wishlist from cookie
    const guestCookie = req.cookies.get("guest_wishlist")?.value || "";
    let guestItems: string[] = [];
    try {
      if (guestCookie) {
        guestItems = JSON.parse(decodeURIComponent(guestCookie));
      }
    } catch {
      guestItems = [];
    }

    if (!guestItems.includes(productId)) {
      guestItems.push(productId);
    }

    const res = NextResponse.json({
      success: true,
      inWishlist: true,
      message: "Added to guest wishlist",
    });

    res.cookies.set("guest_wishlist", encodeURIComponent(JSON.stringify(guestItems)), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return res;
  } catch (error) {
    console.error("[WishlistAPI:add] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
