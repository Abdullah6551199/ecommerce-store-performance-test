"use client";

import React from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSettingsProps {
  settings: Record<string, any>;
  onChange: (patch: Record<string, any>) => void;
}

export function FAQSettings({ settings, onChange }: FAQSettingsProps) {
  const heading = settings.heading ?? "Frequently Asked Questions";
  const variant = settings.variant ?? "accordion";
  const items: FAQItem[] = Array.isArray(settings.items)
    ? settings.items
    : [
        { question: "How long does shipping take?", answer: "Orders are processed within 1-2 business days and typically arrive within 3-5 days." },
        { question: "What is your return policy?", answer: "We offer a 30-day money-back guarantee on all undamaged merchandise." },
      ];

  const updateItem = (index: number, patch: Partial<FAQItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange({ items: next });
  };

  const addItem = () => {
    if (items.length >= 20) return;
    onChange({
      items: [
        ...items,
        { question: `New Question ${items.length + 1}`, answer: "Provide helpful answer here." },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({ items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4 text-xs text-slate-300">
      <div>
        <label className="block text-slate-400 font-medium mb-1">Heading</label>
        <input
          type="text"
          value={heading}
          onChange={(e) => onChange({ heading: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366]"
        />
      </div>

      <div>
        <label className="block text-slate-400 font-medium mb-1">Layout Variant</label>
        <select
          value={variant}
          onChange={(e) => onChange({ variant: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366] [&>option]:bg-slate-900 [&>option]:text-slate-100"
        >
          <option value="accordion">Accordion</option>
          <option value="simple">Simple</option>
          <option value="two_column">Two Column</option>
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-slate-400 font-medium">FAQ Questions ({items.length}/20)</label>
          <button
            type="button"
            onClick={addItem}
            disabled={items.length >= 20}
            className="text-[11px] text-[#25D366] hover:text-emerald-300 disabled:opacity-50"
          >
            + Add FAQ
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400 text-[11px]">Q{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-rose-400 hover:text-rose-300 text-[11px]"
                >
                  Delete
                </button>
              </div>

              <input
                type="text"
                placeholder="Question"
                value={item.question}
                onChange={(e) => updateItem(idx, { question: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-[#25D366]"
              />

              <textarea
                rows={2}
                placeholder="Answer"
                value={item.answer}
                onChange={(e) => updateItem(idx, { answer: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-[#25D366]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
