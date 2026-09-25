import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getChatbotSettings } from '@/apps/chatbot/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const settings = await getChatbotSettings(db);

    // Return safe public settings only
    return NextResponse.json({
      enabled: settings.enabled,
      position: settings.position,
      accentColor: settings.accentColor,
      welcomeMessage: settings.welcomeMessage,
      placeholderText: settings.placeholderText,
      requireLogin: settings.requireLogin,
    });
  } catch (err: any) {
    return NextResponse.json(
      { enabled: true, position: 'bottom-right', accentColor: '#25D366' },
      { status: 200 }
    );
  }
}
