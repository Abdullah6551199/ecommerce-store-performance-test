'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ChatbotDashboardWidget() {
  const [stats, setStats] = useState<{ total: number; active: boolean; model: string }>({
    total: 0,
    active: true,
    model: 'Qwen / DeepSeek',
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/apps/chatbot/settings');
        if (res.ok) {
          const data = (await res.json()) as any;
          setStats({
            total: data.recentConversations?.length || 0,
            active: data.settings?.enabled ?? true,
            model: data.settings?.preferredModel || 'deepseek/deepseek-v4.1-flash:free',
          });
        }
      } catch {}
    }
    loadStats();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">AI Customer Chatbot</h3>
            <p className="text-xs text-gray-400">Multi-model fallback support</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            stats.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {stats.active ? 'Active' : 'Offline'}
        </span>
      </div>

      <div className="my-4 grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3">
        <div>
          <span className="text-[11px] text-gray-500 block">Recent Chats</span>
          <span className="text-lg font-bold text-gray-900">{stats.total}</span>
        </div>
        <div>
          <span className="text-[11px] text-gray-500 block">Active Engine</span>
          <span className="text-xs font-semibold text-emerald-600 truncate block">
            {stats.model.split('/')[1]?.split(':')[0] || 'xKiro Free'}
          </span>
        </div>
      </div>

      <Link
        href="/admin/apps"
        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center justify-between"
      >
        <span>Manage AI Settings</span>
        <span>→</span>
      </Link>
    </div>
  );
}
