"use client";

import React from "react";
import ImageUploadField from "../ImageUploadField";

interface TestimonialItem {
  text: string;
  author: string;
  role: string;
  avatar: string;
}

interface TestimonialsSettingsProps {
  settings: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange: (variant: string) => void;
}

export default function TestimonialsSettings({
  settings = {},
  variant = "cards",
  onChange,
  onVariantChange,
}: TestimonialsSettingsProps) {
  const items = (settings.items as TestimonialItem[]) || [];

  const updateItem = (idx: number, patch: Partial<TestimonialItem>) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], ...patch };
    onChange({ items: updated });
  };

  const addItem = () => {
    if (items.length >= 6) return;
    onChange({
      items: [
        ...items,
        {
          text: "Outstanding quality and craftsmanship. Highly recommended!",
          author: "Alex Morgan",
          role: "Verified Customer",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        },
      ],
    });
  };

  const removeItem = (idx: number) => {
    onChange({
      items: items.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Section Heading
        </label>
        <input
          type="text"
          value={settings.heading || ""}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="What Our Customers Say"
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Layout Variant
        </label>
        <select
          value={variant || "cards"}
          onChange={(e) => onVariantChange(e.target.value)}
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        >
          <option value="cards">Card Grid</option>
          <option value="slider">Single Slider</option>
          <option value="grid">Minimal Grid</option>
        </select>
      </div>

      {/* Testimonials Repeater */}
      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-gray-800 dark:text-gray-200">
            Reviews ({items.length}/6)
          </label>
          {items.length < 6 && (
            <button
              type="button"
              onClick={addItem}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              + Add Review
            </button>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-gray-500">
                  Review #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-[11px] text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase font-semibold">
                  Quote
                </label>
                <textarea
                  rows={2}
                  value={item.text}
                  onChange={(e) => updateItem(idx, { text: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-semibold">
                    Author
                  </label>
                  <input
                    type="text"
                    value={item.author}
                    onChange={(e) => updateItem(idx, { author: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-semibold">
                    Role / Subtitle
                  </label>
                  <input
                    type="text"
                    value={item.role}
                    onChange={(e) => updateItem(idx, { role: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <ImageUploadField
                label="Avatar URL"
                value={item.avatar || ""}
                onChange={(url) => updateItem(idx, { avatar: url })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
