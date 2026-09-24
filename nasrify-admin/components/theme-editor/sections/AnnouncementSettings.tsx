"use client";

import React from "react";

interface AnnouncementSettingsProps {
  settings: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange: (variant: string) => void;
}

export default function AnnouncementSettings({
  settings = {},
  variant = "solid",
  onChange,
  onVariantChange,
}: AnnouncementSettingsProps) {
  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Banner Text
        </label>
        <input
          type="text"
          value={settings.text || ""}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Free shipping on orders over $50"
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Target Link
        </label>
        <input
          type="text"
          value={settings.link || ""}
          onChange={(e) => onChange({ link: e.target.value })}
          placeholder="/shop or https://..."
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            Background Color
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={settings.bg_color || "#18181B"}
              onChange={(e) => onChange({ bg_color: e.target.value })}
              className="h-6 w-8 rounded cursor-pointer border border-gray-200 dark:border-zinc-700 bg-transparent p-0"
            />
            <input
              type="text"
              value={settings.bg_color || "#18181B"}
              onChange={(e) => onChange({ bg_color: e.target.value })}
              className="w-full px-2 py-1 text-[11px] font-mono rounded border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-center"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            Text Color
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={settings.text_color || "#FFFFFF"}
              onChange={(e) => onChange({ text_color: e.target.value })}
              className="h-6 w-8 rounded cursor-pointer border border-gray-200 dark:border-zinc-700 bg-transparent p-0"
            />
            <input
              type="text"
              value={settings.text_color || "#FFFFFF"}
              onChange={(e) => onChange({ text_color: e.target.value })}
              className="w-full px-2 py-1 text-[11px] font-mono rounded border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-center"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Dismissible Close Button
        </label>
        <input
          type="checkbox"
          checked={settings.dismissible !== false}
          onChange={(e) => onChange({ dismissible: e.target.checked })}
          className="h-4 w-4 rounded text-blue-600"
        />
      </div>

      <div className="pt-2">
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Style Variant
        </label>
        <select
          value={variant || "solid"}
          onChange={(e) => onVariantChange(e.target.value)}
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        >
          <option value="solid">Solid Background</option>
          <option value="subtle">Subtle Outline</option>
        </select>
      </div>
    </div>
  );
}
