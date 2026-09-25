'use client';

import React, { useState, useEffect } from 'react';
import { ChatbotSettings, DEFAULT_CHATBOT_SETTINGS } from '@/apps/chatbot/shared/types';

const FREE_MODELS = [
  { id: 'deepseek/deepseek-v4.1-flash:free', label: 'DeepSeek V4.1 Flash (Free)' },
  { id: 'qwen/qwen3.6-plus:free', label: 'Qwen 3.6 Plus (Free, Recommended)' },
  { id: 'qwen/qwen3.7-flash:free', label: 'Qwen 3.7 Flash (Free)' },
  { id: 'qwen/qwen3.5-plus:free', label: 'Qwen 3.5 Plus (Free)' },
  { id: 'minimax/minimax-m3:free', label: 'MiniMax M3 (Free)' },
  { id: 'mistralai/mistral-medium-3.5:free', label: 'Mistral Medium 3.5 (Free)' },
  { id: 'qwen/qwen3.5-397b-a17b:free', label: 'Qwen 3.5 397B (Free)' },
];

export default function ChatbotSettingsComponent() {
  const [settings, setSettings] = useState<ChatbotSettings>(DEFAULT_CHATBOT_SETTINGS);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    reply?: string;
    model_used?: string;
    latencyMs?: number;
    error?: string;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/apps/chatbot/settings');
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data.settings) {
            setSettings(data.settings);
          }
          setHasApiKey(Boolean(data.hasApiKey));
          if (data.recentConversations) {
            setRecentConversations(data.recentConversations);
          }
        }
      } catch (err) {
        console.error('Failed to load chatbot settings', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch('/api/apps/chatbot/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/apps/chatbot/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredModel: settings.preferredModel,
          fallbackModels: settings.fallbackModels,
        }),
      });

      const data = (await res.json()) as any;
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err?.message || 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </span>
            AI Chatbot Configuration
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Store-aware AI customer assistant powered by xKiro multi-model fallback.
          </p>
        </div>

        {/* API Key Status Indicator */}
        <div className="flex items-center gap-2">
          {hasApiKey ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Worker Secret Active (XKIRO_API_KEY)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              API Key Not Set in Worker Secrets
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Chatbot Status</h2>
              <p className="text-sm text-gray-500">
                Turn the floating customer chat widget on or off across your storefront.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>

        {/* AI Model & Routing Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            AI Model & Fallback Routing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Preferred Free Model
              </label>
              <select
                value={settings.preferredModel}
                onChange={(e) => setSettings({ ...settings, preferredModel: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {FREE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Primary model tried first for incoming visitor questions.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Automated Fallback Models
              </label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-1.5">
                {settings.fallbackModels.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-mono">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                If the preferred model encounters 403 or 429 limits, the router fails over automatically.
              </p>
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors disabled:opacity-50"
            >
              {testing ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  Testing Gateway...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Test Connection
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {testResult.success ? (
                  <>
                    <span className="font-bold">✓ Connected</span>
                    <span>Model: {testResult.model_used}</span>
                    <span>({testResult.latencyMs}ms)</span>
                    <span className="italic truncate max-w-xs">"{testResult.reply}"</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold">✗ Failed:</span>
                    <span>{testResult.error}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Behavior & Generation Parameters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Behavior & Response Tuning
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <span>Max Generation Tokens</span>
                <span className="font-mono text-emerald-600">{settings.maxTokens} tokens</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={settings.maxTokens}
                onChange={(e) => setSettings({ ...settings, maxTokens: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Keeps answers concise (100 - 1000 tokens).</p>
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <span>Temperature</span>
                <span className="font-mono text-emerald-600">{settings.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">Lower = factual and strict; Higher = creative.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Store Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={settings.systemPrompt || ''}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              placeholder="e.g. Always mention that orders placed before 2 PM ship the same day."
              className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Appearance & Widget Customization */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Widget Appearance & Content
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="w-10 h-10 p-0.5 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="w-28 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm font-mono text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Widget Position
              </label>
              <select
                value={settings.position}
                onChange={(e) => setSettings({ ...settings, position: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Session Limit
              </label>
              <input
                type="number"
                min="5"
                max="200"
                value={settings.rateLimitPerHour || 30}
                onChange={(e) => setSettings({ ...settings, rateLimitPerHour: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Message
              </label>
              <input
                type="text"
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Placeholder
              </label>
              <input
                type="text"
                value={settings.placeholderText}
                onChange={(e) => setSettings({ ...settings, placeholderText: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveStatus === 'success' && (
            <span className="text-sm font-semibold text-emerald-600 animate-fadeIn">
              ✓ Settings saved successfully!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm font-semibold text-red-600 animate-fadeIn">
              ✗ Failed to save settings
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Recent Conversations Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
          <span>Recent Conversations ({recentConversations.length})</span>
          <span className="text-xs font-normal text-gray-400">Stored securely in D1</span>
        </h2>

        {recentConversations.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No customer conversations recorded yet.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {recentConversations.map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  c.role === 'user'
                    ? 'bg-blue-50/60 border-blue-100 text-blue-900'
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                  <span className="font-semibold uppercase tracking-wider text-gray-600">
                    {c.role === 'user' ? 'Customer' : 'Bot'}
                  </span>
                  <span>{new Date(c.createdAt || Date.now()).toLocaleString()}</span>
                </div>
                <p className="m-0 font-normal">{c.content}</p>
                {c.modelUsed && (
                  <div className="mt-1 text-[10px] text-emerald-600 font-mono">
                    Model: {c.modelUsed} {c.tokensUsed ? `(${c.tokensUsed} tokens)` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
