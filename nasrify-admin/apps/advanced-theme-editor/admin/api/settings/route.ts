import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, advancedEditorSettings } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { getAdvancedEditorSettings, invalidateSettingsCache } from '@/apps/advanced-theme-editor/lib/settings';

export const dynamic = 'force-dynamic';

const updateSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  enableCustomCSS: z.boolean().optional(),
  enableAnimations: z.boolean().optional(),
  enableResponsive: z.boolean().optional(),
  enableBreakpoints: z.boolean().optional(),
  breakpoints: z
    .array(
      z.object({
        name: z.string().min(1),
        width: z.number().int().min(320).max(3840),
      })
    )
    .optional(),
});

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const settings = await getAdvancedEditorSettings(db);
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid settings payload', details: parsed.error.format() }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const data = parsed.data;
    const now = Date.now();

    const updateFields: any = {
      updatedAt: now,
    };

    if (data.enabled !== undefined) updateFields.enabled = data.enabled ? 1 : 0;
    if (data.enableCustomCSS !== undefined) updateFields.enableCustomCss = data.enableCustomCSS ? 1 : 0;
    if (data.enableAnimations !== undefined) updateFields.enableAnimations = data.enableAnimations ? 1 : 0;
    if (data.enableResponsive !== undefined) updateFields.enableResponsive = data.enableResponsive ? 1 : 0;
    if (data.enableBreakpoints !== undefined) updateFields.enableBreakpoints = data.enableBreakpoints ? 1 : 0;
    if (data.breakpoints !== undefined) updateFields.breakpoints = JSON.stringify(data.breakpoints);

    await db
      .insert(advancedEditorSettings)
      .values({
        id: 'default',
        ...updateFields,
      })
      .onConflictDoUpdate({
        target: advancedEditorSettings.id,
        set: updateFields,
      });

    invalidateSettingsCache();
    const updated = await getAdvancedEditorSettings(db);

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update settings' }, { status: 500 });
  }
}
