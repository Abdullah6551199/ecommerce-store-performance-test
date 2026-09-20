import { NextRequest, NextResponse } from "next/server";
import { PUT as updateCoupon } from "@/apps/coupons/admin/api/update/route";
import { DELETE as deleteCoupon } from "@/apps/coupons/admin/api/delete/route";
import { getDb, coupons } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/auth";
import { memoryCoupons } from "@/apps/coupons/lib/coupons";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = getDb();

    if (db) {
      const rows = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: rows[0] });
    }

    const found = memoryCoupons.find((c) => c.id === id);
    if (!found) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: found });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, any>;
  body.id = id;
  const forwardReq = new NextRequest(req.url, {
    method: "PUT",
    headers: req.headers,
    body: JSON.stringify(body),
  });
  return updateCoupon(forwardReq);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const url = new URL(req.url);
  url.searchParams.set("id", id);
  const forwardReq = new NextRequest(url.toString(), {
    method: "DELETE",
    headers: req.headers,
  });
  return deleteCoupon(forwardReq);
}
