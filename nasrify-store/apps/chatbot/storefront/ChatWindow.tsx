'use client';

import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatTypingIndicator from './ChatTypingIndicator';
import { ChatMessage as ChatMessageType, ChatbotSettings } from '@/apps/chatbot/shared/types';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatbotSettings;
  storeName?: string;
}

export default function ChatWindow({
  isOpen,
  onClose,
  settings,
  storeName = 'Store Support',
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const accentColor = settings.accentColor || '#25D366';

  // Initialize session ID
  useEffect(() => {
    let sid = '';
    try {
      sid = localStorage.getItem('chatbot_session_id') || '';
      if (!sid) {
        sid = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('chatbot_session_id', sid);
      }
    } catch {
      sid = `ses_${Date.now()}_temp`;
    }
    setSessionId(sid);
  }, []);

  // Fetch conversation history or initialize welcome message
  useEffect(() => {
    if (!sessionId || !isOpen) return;

    let mounted = true;
    async function loadHistory() {
      try {
        const res = await fetch(`/api/apps/chatbot/history?sessionId=${sessionId}`);
        if (res.ok) {
          const data = (await res.json()) as any;
          if (mounted && data.messages && data.messages.length > 0) {
            setMessages(data.messages);
            return;
          }
        }
      } catch {}

      if (mounted) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: settings.welcomeMessage || 'Hi! How can I help you today?',
            timestamp: Date.now(),
          },
        ]);
      }
    }

    loadHistory();
    return () => {
      mounted = false;
    };
  }, [sessionId, isOpen, settings.welcomeMessage]);

  // Auto-scroll on message change or typing state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessageType = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/apps/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
        }),
      });

      const data = (await res.json()) as any;
      const assistantMsg: ChatMessageType = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I'm having trouble connecting. Please try again.",
        timestamp: Date.now(),
        modelUsed: data.model_used,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Unable to reach the assistant. Please try again later.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes chatWindowEnter {
          0% { opacity: 0; transform: scale(0.94) translateY(16px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes chatBubbleEnter {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${storeName} AI Assistant`}
        className={`fixed z-50 transition-all duration-300 ${
          isMinimized
            ? 'bottom-20 right-6 w-72 h-14 rounded-2xl shadow-xl overflow-hidden'
            : 'inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[380px] sm:h-[560px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden bg-white border border-gray-100'
        }`}
        style={{
          animation: 'chatWindowEnter 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Header (72px tall on desktop) */}
        <div
          className="relative flex items-center justify-between px-5 py-4 text-white select-none flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, #059669)`,
          }}
        >
          <div className="flex items-center gap-3">
            {/* Bot Avatar (circle 40px) */}
            <div className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-inner">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8" y2="16" />
                <line x1="16" y1="16" x2="16" y2="16" />
              </svg>
              {/* Online pulse dot */}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white tracking-wide leading-tight m-0">
                {storeName}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <span className="text-xs font-medium text-white/90">AI Assistant • Online</span>
              </div>
            </div>
          </div>

          {/* Action buttons (Minimize & Close) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMinimized ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 12H6" />
                )}
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Minimized View Shortcut */}
        {!isMinimized && (
          <>
            {/* Message List (Scrollable #FAFAFA background) */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#FAFAFA] flex flex-col justify-start">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} accentColor={accentColor} />
              ))}
              {isLoading && <ChatTypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer Area */}
            <div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-1.5">
              <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.slice(0, 300))}
                  onKeyDown={handleKeyDown}
                  placeholder={settings.placeholderText || 'Ask about products, orders, shipping...'}
                  rows={1}
                  className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-gray-800 placeholder-gray-400 py-1 max-h-24 leading-relaxed"
                  aria-label="Your message"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all flex-shrink-0 shadow-sm ${
                    !inputValue.trim() || isLoading
                      ? 'opacity-40 cursor-not-allowed bg-gray-400'
                      : 'hover:scale-105 active:scale-95'
                  }`}
                  style={
                    inputValue.trim() && !isLoading
                      ? { background: `linear-gradient(135deg, ${accentColor}, #059669)` }
                      : undefined
                  }
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4 translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>

              {/* Character limit hint & branding */}
              <div className="flex items-center justify-between px-1 text-[11px] text-gray-400">
                <span>Press Enter to send</span>
                <span>{inputValue.length}/300</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
