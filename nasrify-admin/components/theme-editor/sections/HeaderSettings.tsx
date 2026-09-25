"use client";

import React from "react";
import ImageUploadField from "../ImageUploadField";

interface HeaderSettingsProps {
  settings: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange: (variant: string) => void;
}

export default function HeaderSettings({
  settings = {},
  variant = "classic",
  onChange,
  onVariantChange,
}: HeaderSettingsProps) {
  const menuItems = (settings.menu_items as Array<{ label: string; url: string }>) || [];

  const updateMenuItem = (idx: number, patch: { label?: string; url?: string }) => {
    const updated = [...menuItems];
    updated[idx] = { ...updated[idx], ...patch };
    onChange({ menu_items: updated });
  };

  const addMenuItem = () => {
    if (menuItems.length >= 8) return;
    onChange({
      menu_items: [...menuItems, { label: "New Link", url: "/shop" }],
    });
  };

  const removeMenuItem = (idx: number) => {
    onChange({
      menu_items: menuItems.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-4 text-xs">
      <ImageUploadField
        label="Header Logo"
        value={settings.logo_url || ""}
        onChange={(url) => onChange({ logo_url: url })}
        description="Leave empty to use store name text"
      />

      <div>
        <label className="font-semibold text-slate-300">
          Logo Text Fallback
        </label>
        <input
          type="text"
          value={settings.logo_text || ""}
          onChange={(e) => onChange({ logo_text: e.target.value })}
          placeholder="Nasrify Store"
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 focus:border-green-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="font-semibold text-slate-300">
          Sticky Header on Scroll
        </label>
        <input
          type="checkbox"
          checked={settings.sticky !== false}
          onChange={(e) => onChange({ sticky: e.target.checked })}
          className="h-4 w-4 rounded text-green-500 bg-slate-900 border-slate-700"
        />
      </div>

      <div className="pt-2">
        <label className="font-semibold text-slate-300">
          Header Variant
        </label>
        <select
          value={variant || "classic"}
          onChange={(e) => onVariantChange(e.target.value)}
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 focus:border-green-500 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
        >
          <option value="classic">Classic (Logo Left, Menu Center)</option>
          <option value="centered">Centered (Logo Top Center)</option>
          <option value="minimal">Minimal (Logo Left, Action Icons Right)</option>
        </select>
      </div>

      {/* Menu Items Repeater */}
      <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-gray-800 dark:text-gray-200">
            Navigation Menu ({menuItems.length}/8)
          </label>
          {menuItems.length < 8 && (
            <button
              type="button"
              onClick={addMenuItem}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              + Add Link
            </button>
          )}
        </div>

        <div className="space-y-2">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400">
                  Item #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeMenuItem(idx)}
                  className="text-[11px] text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateMenuItem(idx, { label: e.target.value })}
                  placeholder="Label"
                  className="px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => updateMenuItem(idx, { url: e.target.value })}
                  placeholder="URL / Path"
                  className="px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
