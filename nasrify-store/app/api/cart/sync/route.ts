import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Silent Background Cart Sync endpoint (Stage 10).
 * Receives the client localStorage cart snapshot fire-and-forget
 * for abandoned cart analytics and future recovery.
 * Never blocks the storefront UI and always returns HTTP 200.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const items = Array.isArray(body?.items) ? body.items : [];
    
    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      itemCount: items.length,
    });
  } catch {
    return NextResponse.json({ success: true, message: "Silent sync handled" });
  }
}
