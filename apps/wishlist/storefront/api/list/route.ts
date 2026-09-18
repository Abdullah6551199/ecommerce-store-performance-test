import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getCustomerWishlist, getProductsByIds, getWishlistAppSettings } from "@/apps/wishlist/lib/wishlist";

export const dynamic = "force-dynamic";

/**
 * GET /api/wishlist/list
 * Retrieves wishlist items for the authenticated customer or guest session.
 */
export async function GET(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (customer) {
      const items = await getCustomerWishlist(customer.id);
      return NextResponse.json(
        { success: true, count: items.length, items },
        {
          headers: {
            "Cache-Control": "private, max-age=20, stale-while-revalidate=60",
          },
        }
      );
    }

    // Guest wishlist
    const settings = await getWishlistAppSettings();
    if (settings.requireLogin) {
      return NextResponse.json(
        { success: true, count: 0, items: [], message: "Login required" },
        {
          headers: {
            "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
          },
        }
      );
    }

    const guestCookie = req.cookies.get("guest_wishlist")?.value || "";
    let guestIds: string[] = [];
    try {
      if (guestCookie) {
        guestIds = JSON.parse(decodeURIComponent(guestCookie));
      }
    } catch {
      guestIds = [];
    }

    if (guestIds.length === 0) {
      return NextResponse.json({ success: true, count: 0, items: [] });
    }

    const products = await getProductsByIds(guestIds);
    const items = products.map((p) => ({
      id: `guest-${p.id}`,
      productId: p.id,
      createdAt: new Date().toISOString(),
      product: p,
    }));

    return NextResponse.json(
      { success: true, count: items.length, items },
      {
        headers: {
          "Cache-Control": "private, max-age=20, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("[WishlistAPI:list] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
