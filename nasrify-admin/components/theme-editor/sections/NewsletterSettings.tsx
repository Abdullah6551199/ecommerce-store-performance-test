"use client";

import React from "react";

interface NewsletterSettingsProps {
  settings: Record<string, any>;
  onChange: (patch: Record<string, any>) => void;
}

export function NewsletterSettings({ settings, onChange }: NewsletterSettingsProps) {
  const heading = settings.heading ?? "Subscribe to our newsletter";
  const subheading = settings.subheading ?? "Get the latest updates, exclusive deals, and more.";
  const placeholder = settings.placeholder ?? "Enter your email address";
  const button_text = settings.button_text ?? "Subscribe";
  const bg_color = settings.bg_color ?? "#1e293b";

  return (
    <div className="space-y-4 text-xs text-slate-300">
      <div>
        <label className="block text-slate-400 font-medium mb-1">Heading</label>
        <input
          type="text"
          value={heading}
          onChange={(e) => onChange({ heading: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-slate-400 font-medium mb-1">Subheading</label>
        <textarea
          rows={2}
          value={subheading}
          onChange={(e) => onChange({ subheading: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-slate-400 font-medium mb-1">Input Placeholder</label>
        <input
          type="text"
          value={placeholder}
          onChange={(e) => onChange({ placeholder: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-slate-400 font-medium mb-1">Button Text</label>
        <input
          type="text"
          value={button_text}
          onChange={(e) => onChange({ button_text: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-slate-400 font-medium mb-1">Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={bg_color}
            onChange={(e) => onChange({ bg_color: e.target.value })}
            className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={bg_color}
            onChange={(e) => onChange({ bg_color: e.target.value })}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 uppercase font-mono text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
