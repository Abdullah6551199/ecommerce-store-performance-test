import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { getDb, chatbotSettings, chatbotConversations } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import {
  getChatbotSettings,
  getXKiroApiKey,
  invalidateChatbotSettingsCache,
} from '@/apps/chatbot/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const settings = await getChatbotSettings(db);
    const hasApiKey = Boolean(getXKiroApiKey());

    // Fetch last 20 conversations for admin inspection
    let recentConversations: any[] = [];
    if (db) {
      try {
        recentConversations = await db
          .select({
            id: chatbotConversations.id,
            sessionId: chatbotConversations.sessionId,
            role: chatbotConversations.role,
            content: chatbotConversations.content,
            modelUsed: chatbotConversations.modelUsed,
            tokensUsed: chatbotConversations.tokensUsed,
            createdAt: chatbotConversations.createdAt,
          })
          .from(chatbotConversations)
          .orderBy(desc(chatbotConversations.createdAt))
          .limit(20);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      settings,
      hasApiKey,
      recentConversations,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as any;
    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const now = Date.now();
    const updatedValues = {
      enabled: body.enabled ? 1 : 0,
      preferredModel: body.preferredModel || 'deepseek/deepseek-v4.1-flash:free',
      fallbackModels: JSON.stringify(body.fallbackModels || []),
      systemPrompt: body.systemPrompt || '',
      maxTokens: Math.max(100, Math.min(1000, Number(body.maxTokens) || 300)),
      temperature: Math.max(0, Math.min(1, Number(body.temperature) || 0.7)),
      welcomeMessage: body.welcomeMessage || 'Hi! How can I help you today?',
      placeholderText: body.placeholderText || 'Ask about products, orders, shipping...',
      position: body.position === 'bottom-left' ? 'bottom-left' : 'bottom-right',
      accentColor: body.accentColor || '#25D366',
      updatedAt: now,
    };

    const existing = await db
      .select({ id: chatbotSettings.id })
      .from(chatbotSettings)
      .where(eq(chatbotSettings.id, 'default'))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(chatbotSettings)
        .set(updatedValues)
        .where(eq(chatbotSettings.id, 'default'));
    } else {
      await db.insert(chatbotSettings).values({
        id: 'default',
        ...updatedValues,
      });
    }

    invalidateChatbotSettingsCache();

    return NextResponse.json({
      success: true,
      message: 'Chatbot settings saved successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
