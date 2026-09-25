'use client';

import React, { useState } from 'react';

interface CustomCSSControlProps {
  value?: string;
  onChange: (val: string) => void;
  sectionId?: string;
}

export function CustomCSSControl({ value = '', onChange, sectionId = 'current' }: CustomCSSControlProps) {
  const [warning, setWarning] = useState<string | null>(null);

  const handleChange = (newVal: string) => {
    if (/@import\s+/i.test(newVal)) {
      setWarning('@import statements are blocked for security and performance.');
    } else if (/url\(\s*['"]?(?:https?:|\/\/)[^'"]+['"]?\s*\)/i.test(newVal)) {
      setWarning('External HTTP/HTTPS URLs in url() are blocked.');
    } else {
      setWarning(null);
    }
    onChange(newVal);
  };

  const insertSnippet = (snippet: string) => {
    const updated = value ? `${value.trim()}\n\n${snippet}` : snippet;
    handleChange(updated);
  };

  return (
    <div className="space-y-3 p-3 bg-gray-50/70 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between pb-1 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Custom CSS</span>
        <span className="text-[10px] font-mono text-gray-600">.section-{sectionId}</span>
      </div>

      <p className="text-[11px] text-gray-700 leading-relaxed">
        Use <code className="px-1 py-0.5 bg-gray-200 text-indigo-700 rounded-sm font-semibold">selector</code> to target the root container of this section. Example:{' '}
        <code className="text-gray-700 font-mono">selector:hover &#123; opacity: 0.95; &#125;</code>
      </p>

      {warning && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-800 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{warning}</span>
        </div>
      )}

      {/* Editor Box */}
      <div className="relative rounded-md overflow-hidden border border-gray-800 bg-[#1E1E2E] shadow-inner">
        <div className="px-3 py-1.5 bg-[#181825] border-b border-gray-800 flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>CSS Stylesheet</span>
          <span>UTF-8</span>
        </div>
        <textarea
          rows={6}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`selector {\n  /* Your custom CSS here */\n  transition: all 0.3s ease;\n}`}
          spellCheck={false}
          className="w-full p-3 font-mono text-xs text-emerald-400 bg-transparent border-0 focus:ring-0 focus:outline-none resize-y leading-relaxed"
        />
      </div>

      {/* Quick Snippets */}
      <div className="flex flex-wrap gap-1 pt-1">
        <span className="text-[10px] text-gray-600 font-medium self-center mr-1">Snippets:</span>
        <button
          type="button"
          onClick={() => insertSnippet('selector:hover {\n  transform: translateY(-4px);\n  transition: transform 0.25s ease;\n}')}
          className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 rounded-sm text-[10px]"
        >
          Hover Lift
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('selector {\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n}')}
          className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 rounded-sm text-[10px]"
        >
          Glass Blur
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('selector {\n  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));\n}')}
          className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 rounded-sm text-[10px]"
        >
          Subtle Gradient
        </button>
      </div>
    </div>
  );
}
