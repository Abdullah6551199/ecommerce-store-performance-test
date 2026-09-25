'use client';

import React, { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import { ChatbotSettings, DEFAULT_CHATBOT_SETTINGS } from '@/apps/chatbot/shared/types';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ChatbotSettings>(DEFAULT_CHATBOT_SETTINGS);
  const [hasUnread, setHasUnread] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadSettings() {
      try {
        const res = await fetch('/api/apps/chatbot/settings');
        if (res.ok) {
          const data = (await res.json()) as any;
          if (mounted) {
            setSettings((prev) => ({ ...prev, ...data }));
          }
        }
      } catch {
        // Fallback to default
      } finally {
        if (mounted) setLoaded(true);
      }
    }

    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  if (!loaded || !settings.enabled) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const isLeft = settings.position === 'bottom-left';
  const accentColor = settings.accentColor || '#25D366';

  return (
    <div
      className={`fixed z-50 ${isLeft ? 'left-6' : 'right-6'} bottom-6 flex flex-col ${
        isLeft ? 'items-start' : 'items-end'
      } pointer-events-auto`}
      id="chatbot-widget-container"
    >
      <style>{`
        @keyframes softPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.3; }
        }
      `}</style>

      {/* Floating Chat Window */}
      {isOpen && (
        <ChatWindow
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          settings={settings}
          storeName="Store Support"
        />
      )}

      {/* Floating Action Button (56x56px) */}
      {!isOpen && (
        <div className="relative group">
          {/* Subtle glowing pulse ring */}
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: accentColor,
              animation: 'softPulse 2.5s infinite ease-in-out',
            }}
          />

          <button
            type="button"
            onClick={handleToggle}
            className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #059669)`,
              boxShadow: `0 8px 24px -4px ${accentColor}66`,
            }}
            aria-label="Open AI Store Support Chat"
            aria-expanded={isOpen}
          >
            {/* MessageCircle 24px Icon */}
            <svg
              className="w-6 h-6 transform transition-transform duration-200 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>

            {/* Unread badge */}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                1
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
