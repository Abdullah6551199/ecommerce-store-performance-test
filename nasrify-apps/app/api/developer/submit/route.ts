import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, appMarketplaceListings, appMarketplaceVersions } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { invalidateListingsCache } from "@/lib/marketplace/listings";

export const dynamic = "force-dynamic";

const submitListingSchema = z.object({
  id: z.string().optional(),
  appId: z
    .string()
    .min(2, "App ID must be at least 2 characters")
    .max(50, "App ID cannot exceed 50 characters")
    .regex(/^[a-z0-9-]+$/, "App ID must be lowercase alphanumeric and hyphens (kebab-case)"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  version: z.string().min(1, "Version is required").max(20),
  description: z.string().min(10, "Description must be at least 10 characters"),
  author: z.string().min(2, "Author name is required").max(100),
  authorUrl: z.string().url("Invalid Author URL").or(z.literal("")).optional(),
  iconUrl: z.string().optional(),
  category: z.string().min(2, "Category is required"),
  pricing: z.enum(["free", "paid"]),
  price: z.number().min(0).optional().default(0),
  manifestJson: z.string().optional(),
  changelog: z.string().optional(),
  submitForReview: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = submitListingSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Validation failed",
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Validate manifest JSON if provided
    if (data.manifestJson && data.manifestJson.trim()) {
      try {
        JSON.parse(data.manifestJson);
      } catch {
        return NextResponse.json(
          { success: false, error: "Manifest must be valid JSON" },
          { status: 400 }
        );
      }
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const now = Date.now();
    const newStatus = data.submitForReview ? "pending" : "draft";

    // Check if updating existing listing
    if (data.id) {
      const existing = await db
        .select()
        .from(appMarketplaceListings)
        .where(
          and(
            eq(appMarketplaceListings.id, data.id),
            eq(appMarketplaceListings.submittedBy, admin.email)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: "Listing not found or you do not have permission to edit it" },
          { status: 404 }
        );
      }

      await db
        .update(appMarketplaceListings)
        .set({
          name: data.name,
          version: data.version,
          description: data.description,
          author: data.author,
          authorUrl: data.authorUrl || null,
          iconUrl: data.iconUrl || null,
          category: data.category,
          pricing: data.pricing,
          price: data.price || 0,
          status: newStatus,
          submittedAt: data.submitForReview ? now : existing[0].submittedAt,
          manifestJson: data.manifestJson || null,
          changelog: data.changelog || null,
          updatedAt: now,
        })
        .where(eq(appMarketplaceListings.id, data.id));

      // Add version record
      await db.insert(appMarketplaceVersions).values({
        id: crypto.randomUUID(),
        listingId: data.id,
        version: data.version,
        submittedAt: now,
        manifestJson: data.manifestJson || null,
        downloadUrl: null,
        status: newStatus === "pending" ? "pending" : "approved",
        notes: data.changelog || "Version update",
      });

      invalidateListingsCache();

      return NextResponse.json({
        success: true,
        message: data.submitForReview
          ? "App submitted for Nasrify Team approval"
          : "Draft saved successfully",
        listingId: data.id,
        status: newStatus,
      });
    }

    // Check if appId is already taken
    const existingAppId = await db
      .select({ id: appMarketplaceListings.id })
      .from(appMarketplaceListings)
      .where(eq(appMarketplaceListings.appId, data.appId))
      .limit(1);

    if (existingAppId.length > 0) {
      return NextResponse.json(
        { success: false, error: `An app with ID "${data.appId}" already exists.` },
        { status: 409 }
      );
    }

    const listingId = crypto.randomUUID();
    await db.insert(appMarketplaceListings).values({
      id: listingId,
      appId: data.appId,
      version: data.version,
      name: data.name,
      description: data.description,
      author: data.author,
      authorUrl: data.authorUrl || null,
      iconUrl: data.iconUrl || null,
      category: data.category,
      pricing: data.pricing,
      price: data.price || 0,
      status: newStatus,
      submittedBy: admin.email,
      submittedAt: data.submitForReview ? now : null,
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
      downloadUrl: null,
      manifestJson: data.manifestJson || null,
      changelog: data.changelog || null,
      createdAt: now,
      updatedAt: now,
    });

    // Version tracking
    await db.insert(appMarketplaceVersions).values({
      id: crypto.randomUUID(),
      listingId,
      version: data.version,
      submittedAt: now,
      manifestJson: data.manifestJson || null,
      downloadUrl: null,
      status: newStatus === "pending" ? "pending" : "approved",
      notes: data.changelog || "Initial submission",
    });

    invalidateListingsCache();

    return NextResponse.json({
      success: true,
      message: data.submitForReview
        ? "App submitted for Nasrify Team approval"
        : "Draft saved successfully",
      listingId,
      status: newStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit app" },
      { status: 500 }
    );
  }
}
