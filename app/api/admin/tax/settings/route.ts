import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, taxSettings, type TaxSettingRecord } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { getTaxSettings, memoryTaxSettings } from "@/lib/tax";

export const dynamic = "force-dynamic";

const updateSettingsSchema = z.object({
  isEnabled: z.boolean().optional(),
  defaultRate: z.coerce.number().min(0).max(100).optional(),
  defaultLabel: z.string().trim().optional(),
  defaultTaxType: z.enum(["inclusive", "exclusive"]).optional(),
  applyToShipping: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const settings = await getTaxSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Failed to fetch tax settings:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tax settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = updateSettingsSchema.parse(body);

    const db = getDb();
    const now = new Date().toISOString();

    if (db) {
      const existing = await db.select().from(taxSettings).limit(1);
      const updatePayload: Partial<TaxSettingRecord> = {
        updatedAt: now,
      };

      if (validated.isEnabled !== undefined) updatePayload.isEnabled = validated.isEnabled;
      if (validated.defaultRate !== undefined) updatePayload.defaultRate = validated.defaultRate;
      if (validated.defaultLabel !== undefined) updatePayload.defaultLabel = validated.defaultLabel;
      if (validated.defaultTaxType !== undefined) updatePayload.defaultTaxType = validated.defaultTaxType;
      if (validated.applyToShipping !== undefined) updatePayload.applyToShipping = validated.applyToShipping;

      if (existing.length > 0) {
        await db.update(taxSettings).set(updatePayload).where(eq(taxSettings.id, existing[0].id));
      } else {
        await db.insert(taxSettings).values({
          id: "tax_settings_default",
          tenantId: null,
          isEnabled: validated.isEnabled ?? true,
          defaultRate: validated.defaultRate ?? 0,
          defaultLabel: validated.defaultLabel ?? "Tax",
          defaultTaxType: validated.defaultTaxType ?? "exclusive",
          applyToShipping: validated.applyToShipping ?? false,
          createdAt: now,
          updatedAt: now,
        });
      }

      const updated = await getTaxSettings();
      return NextResponse.json({
        success: true,
        data: updated,
        message: "Tax settings updated successfully",
      });
    } else {
      Object.assign(memoryTaxSettings, {
        ...validated,
        updatedAt: now,
      });
      return NextResponse.json({
        success: true,
        data: memoryTaxSettings,
        message: "Tax settings updated successfully",
      });
    }
  } catch (error) {
    console.error("Failed to update tax settings:", error);
    const msg = error instanceof z.ZodError ? error.issues[0]?.message : "Failed to update tax settings";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
