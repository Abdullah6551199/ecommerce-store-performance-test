"use client";

import React, { useState } from "react";

interface CustomCSSControlProps {
  label?: string;
  value?: string;
  onChange: (css: string) => void;
  description?: string;
}

export function sanitizeCustomCss(rawCss: string): string {
  if (!rawCss) return "";
  let clean = rawCss
    // Strip <script> tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Strip @import rules (prevents remote CSS injections)
    .replace(/@import\s+[^;]+;/gi, "/* @import blocked */")
    // Strip javascript: / vbscript: expressions in URLs
    .replace(/url\s*\(\s*['"]?(?:javascript|vbscript|data:text\/html):/gi, "url('blocked:")
    // Strip expression() (IE legacy execution)
    .replace(/expression\s*\([^)]*\)/gi, "/* expression blocked */");

  return clean;
}

const SNIPPETS = [
  {
    name: "Glassmorphism",
    code: `selector {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}`,
  },
  {
    name: "Neon Glow",
    code: `selector {\n  box-shadow: 0 0 25px rgba(34, 197, 94, 0.4),\n              inset 0 0 15px rgba(34, 197, 94, 0.2);\n}`,
  },
  {
    name: "Diagonal Skew",
    code: `selector {\n  clip-path: polygon(0 0, 100% 4vw, 100% 100%, 0 calc(100% - 4vw));\n}`,
  },
  {
    name: "Hover Lift",
    code: `selector:hover {\n  transform: translateY(-8px) scale(1.01);\n  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);\n}`,
  },
];

export function CustomCSSControl({
  label = "Custom CSS",
  value = "",
  onChange,
  description = "Write custom CSS targeting this section using the `selector` keyword.",
}: CustomCSSControlProps) {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleChange = (newVal: string) => {
    onChange(sanitizeCustomCss(newVal));
  };

  const insertSnippet = (code: string) => {
    const combined = value ? `${value}\n\n${code}` : code;
    handleChange(combined);
  };

  return (
    <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
            {label}
          </label>
          {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
        </div>
        <span className="text-[10px] font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded">
          selector &#123; ... &#125;
        </span>
      </div>

      {/* Snippet shortcuts */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-slate-500">Snippets:</span>
        {SNIPPETS.map((snip) => (
          <button
            key={snip.name}
            type="button"
            onClick={() => insertSnippet(snip.code)}
            className="px-2 py-0.5 text-[10px] bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded transition-colors"
          >
            + {snip.name}
          </button>
        ))}
      </div>

      {/* Code Editor */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          rows={7}
          spellCheck={false}
          className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 rounded-lg p-3 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none resize-y"
          placeholder={`/* Example */\nselector {\n  border-radius: 20px;\n  overflow: hidden;\n}\nselector h2 {\n  color: #22c55e;\n}`}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>Use `selector` to reference this section uniquely</span>
        <span>Auto-sanitized & scoped</span>
      </div>
    </div>
  );
}
