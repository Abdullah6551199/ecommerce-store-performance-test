'use client';

import React from 'react';
import { ChatMessage as ChatMessageType } from '@/apps/chatbot/shared/types';

interface ChatMessageProps {
  message: ChatMessageType;
  accentColor?: string;
}

export default function ChatMessage({ message, accentColor = '#25D366' }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const formattedTime = new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group flex items-end gap-2 my-2 transition-all duration-200 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
      style={{
        animation: 'chatBubbleEnter 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Bot Avatar for assistant */}
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, #059669)`,
          }}
          aria-hidden="true"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" />
            <line x1="16" y1="16" x2="16" y2="16" />
          </svg>
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`relative max-w-[80%] px-4 py-2.5 shadow-sm text-[14px] leading-relaxed break-words select-text ${
          isUser
            ? 'text-white rounded-2xl rounded-br-sm'
            : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm'
        }`}
        style={
          isUser
            ? {
                background: `linear-gradient(135deg, ${accentColor}, #059669)`,
              }
            : undefined
        }
      >
        <p className="whitespace-pre-wrap font-normal m-0">{message.content}</p>

        {/* Timestamp */}
        <div
          className={`text-[10px] mt-1 tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
            isUser ? 'text-white/80 text-right' : 'text-gray-400 text-left'
          }`}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
