import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, themeMarketplaceListings, themeMarketplaceVersions } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { invalidateThemesCache } from "@/lib/themes/marketplace";

export const dynamic = "force-dynamic";

const submitThemeSchema = z.object({
  id: z.string().optional(),
  themeId: z
    .string()
    .min(2, "Theme ID must be at least 2 characters")
    .max(50, "Theme ID cannot exceed 50 characters")
    .regex(/^[a-z0-9-]+$/, "Theme ID must be lowercase alphanumeric and hyphens (kebab-case)"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  version: z.string().min(1, "Version is required").max(20),
  description: z.string().min(10, "Description must be at least 10 characters"),
  author: z.string().min(2, "Author name is required").max(100),
  authorUrl: z.string().url("Invalid Author URL").or(z.literal("")).optional(),
  previewUrl: z.string().optional(),
  screenshotUrls: z.string().optional(), // JSON array string or comma separated
  category: z.string().min(2, "Category is required"),
  pricing: z.enum(["free", "paid"]),
  price: z.number().min(0).optional().default(0),
  configJson: z.string().optional(),
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
    const parseResult = submitThemeSchema.safeParse(body);

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

    // Validate config JSON if provided
    if (data.configJson && data.configJson.trim()) {
      try {
        JSON.parse(data.configJson);
      } catch {
        return NextResponse.json(
          { success: false, error: "Theme config must be valid JSON" },
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

    // Format screenshotUrls as JSON array string
    let formattedScreenshots = "[]";
    if (data.screenshotUrls) {
      try {
        const parsed = JSON.parse(data.screenshotUrls);
        formattedScreenshots = Array.isArray(parsed) ? JSON.stringify(parsed) : JSON.stringify([data.screenshotUrls]);
      } catch {
        // Assume comma-separated
        const list = data.screenshotUrls
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        formattedScreenshots = JSON.stringify(list);
      }
    }

    // Check if updating existing listing
    if (data.id) {
      const existing = await db
        .select()
        .from(themeMarketplaceListings)
        .where(
          and(
            eq(themeMarketplaceListings.id, data.id),
            eq(themeMarketplaceListings.submittedBy, admin.email)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: "Theme listing not found or permission denied" },
          { status: 404 }
        );
      }

      await db
        .update(themeMarketplaceListings)
        .set({
          name: data.name,
          version: data.version,
          description: data.description,
          author: data.author,
          authorUrl: data.authorUrl || null,
          previewUrl: data.previewUrl || null,
          screenshotUrls: formattedScreenshots,
          category: data.category,
          pricing: data.pricing,
          price: data.price || 0,
          status: newStatus,
          submittedAt: data.submitForReview ? now : existing[0].submittedAt,
          configJson: data.configJson || null,
          changelog: data.changelog || null,
          updatedAt: now,
        })
        .where(eq(themeMarketplaceListings.id, data.id));

      // Record new version in versions table
      await db.insert(themeMarketplaceVersions).values({
        id: crypto.randomUUID(),
        listingId: data.id,
        version: data.version,
        submittedAt: now,
        configJson: data.configJson || null,
        downloadUrl: null,
        status: newStatus === "pending" ? "pending" : "approved",
        notes: data.changelog || "Version update",
      });

      invalidateThemesCache();

      return NextResponse.json({
        success: true,
        message: data.submitForReview
          ? "Theme submitted for super admin approval"
          : "Draft saved successfully",
        listingId: data.id,
        status: newStatus,
      });
    }

    // Check if themeId is already taken
    const existingTheme = await db
      .select({ id: themeMarketplaceListings.id })
      .from(themeMarketplaceListings)
      .where(eq(themeMarketplaceListings.themeId, data.themeId))
      .limit(1);

    if (existingTheme.length > 0) {
      return NextResponse.json(
        { success: false, error: `A theme with ID "${data.themeId}" already exists.` },
        { status: 409 }
      );
    }

    const listingId = crypto.randomUUID();
    await db.insert(themeMarketplaceListings).values({
      id: listingId,
      themeId: data.themeId,
      version: data.version,
      name: data.name,
      description: data.description,
      author: data.author,
      authorUrl: data.authorUrl || null,
      previewUrl: data.previewUrl || null,
      screenshotUrls: formattedScreenshots,
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
      configJson: data.configJson || null,
      changelog: data.changelog || null,
      createdAt: now,
      updatedAt: now,
    });

    // Record initial version
    await db.insert(themeMarketplaceVersions).values({
      id: crypto.randomUUID(),
      listingId,
      version: data.version,
      submittedAt: now,
      configJson: data.configJson || null,
      downloadUrl: null,
      status: newStatus === "pending" ? "pending" : "approved",
      notes: data.changelog || "Initial submission",
    });

    invalidateThemesCache();

    return NextResponse.json({
      success: true,
      message: data.submitForReview
        ? "Theme submitted for super admin approval"
        : "Draft saved successfully",
      listingId,
      status: newStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit theme" },
      { status: 500 }
    );
  }
}
