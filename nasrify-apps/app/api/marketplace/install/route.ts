import { NextRequest, NextResponse } from "next/server";
import { getListingByAppId } from "@/lib/marketplace/listings";
import { recordAppInstall } from "@/lib/marketplace/installs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId");
  const storeId = searchParams.get("storeId") || "default-store";

  const adminBaseUrl =
    process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";

  if (!appId) {
    return NextResponse.redirect(`${adminBaseUrl}/admin/apps`);
  }

  try {
    const listing = await getListingByAppId(appId);
    if (listing) {
      await recordAppInstall({
        listingId: listing.id,
        storeId,
      });
    }
  } catch (_e) {
    // Non-blocking for redirect
  }

  const destination = `${adminBaseUrl}/admin/apps?install=${encodeURIComponent(appId)}`;
  return NextResponse.redirect(destination, { status: 302 });
}
