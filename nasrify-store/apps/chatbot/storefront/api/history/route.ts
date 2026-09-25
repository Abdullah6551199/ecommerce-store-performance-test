import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { getDb, chatbotConversations } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ messages: [] });
    }

    const rows = await db
      .select({
        id: chatbotConversations.id,
        role: chatbotConversations.role,
        content: chatbotConversations.content,
        timestamp: chatbotConversations.createdAt,
        modelUsed: chatbotConversations.modelUsed,
      })
      .from(chatbotConversations)
      .where(eq(chatbotConversations.sessionId, sessionId))
      .orderBy(asc(chatbotConversations.createdAt))
      .limit(50);

    return NextResponse.json({
      messages: rows.map((r: any) => ({
        id: r.id,
        role: r.role,
        content: r.content,
        timestamp: r.timestamp || Date.now(),
        modelUsed: r.modelUsed,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ messages: [], error: err.message }, { status: 500 });
  }
}
