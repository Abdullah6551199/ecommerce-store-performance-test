import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getThemeSettings, updateThemeSettings, DEFAULT_THEME_SETTINGS } from "@/lib/theme";
import { z } from "zod";

export const dynamic = "force-dynamic";

const colorsSchema = z.object({
  primary: z.string().min(1, "Primary color is required"),
  secondary: z.string().min(1, "Secondary color is required"),
  accent: z.string().min(1, "Accent color is required"),
  background: z.string().min(1, "Background color is required"),
  text: z.string().min(1, "Text color is required"),
  mutedText: z.string().min(1, "Muted text color is required"),
  border: z.string().min(1, "Border color is required"),
  success: z.string().min(1, "Success color is required"),
  error: z.string().min(1, "Error color is required"),
});

const typographySchema = z.object({
  headingFont: z.string().min(1, "Heading font is required"),
  bodyFont: z.string().min(1, "Body font is required"),
  buttonFont: z.string().min(1, "Button font is required"),
});

const designSchema = z.object({
  containerWidth: z.string().min(1, "Container width is required"),
  borderRadius: z.string().min(1, "Border radius is required"),
  cardRadius: z.string().min(1, "Card radius is required"),
  buttonRadius: z.string().min(1, "Button radius is required"),
  shadows: z.enum(["none", "soft", "medium", "intense"]),
  spacing: z.enum(["compact", "normal", "spacious"]),
});

const otherSchema = z.object({
  storeLogo: z.string().optional().default(""),
  favicon: z.string().optional().default(""),
  announcementBarText: z.string().optional().default(""),
});

const themeSettingsSchema = z.object({
  colors: colorsSchema.partial().optional(),
  typography: typographySchema.partial().optional(),
  design: designSchema.partial().optional(),
  other: otherSchema.partial().optional(),
  action: z.enum(["reset_defaults"]).optional(),
});

/**
 * GET /api/admin/appearance
 * Protected route: Returns current theme settings.
 */
export async function GET(req: NextRequest) {
  try {
    const sessionToken =
      req.cookies.get("admin_session")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");
    const admin = await getCurrentAdmin(sessionToken);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const settings = await getThemeSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("[GET /api/admin/appearance] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve theme settings." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/appearance
 * Protected route: Updates theme settings with Zod validation.
 */
export async function PUT(req: NextRequest) {
  try {
    const sessionToken =
      req.cookies.get("admin_session")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");
    const admin = await getCurrentAdmin(sessionToken);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;

    // Reset to defaults if requested
    if (body?.action === "reset_defaults") {
      const resetTheme = await updateThemeSettings(DEFAULT_THEME_SETTINGS);
      return NextResponse.json({
        success: true,
        message: "Theme settings reset to default brand configuration.",
        data: resetTheme,
      });
    }

    const parsed = themeSettingsSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid theme payload.",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const updated = await updateThemeSettings(parsed.data);
    return NextResponse.json({
      success: true,
      message: "Theme appearance updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("[PUT /api/admin/appearance] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update appearance settings.",
      },
      { status: 500 }
    );
  }
}
