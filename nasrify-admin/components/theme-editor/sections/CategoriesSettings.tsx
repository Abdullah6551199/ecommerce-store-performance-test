"use client";

import React, { useState } from "react";
import MultiCategoryPicker from "../MultiCategoryPicker";

interface CategoriesSettingsProps {
  settings: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange: (variant: string) => void;
}

export default function CategoriesSettings({
  settings = {},
  variant = "grid",
  onChange,
  onVariantChange,
}: CategoriesSettingsProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const categoryIds = (settings.category_ids as string[]) || [];

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
          placeholder="Shop by Category"
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Columns
        </label>
        <select
          value={settings.columns || 4}
          onChange={(e) => onChange({ columns: parseInt(e.target.value, 10) })}
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        >
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
          <option value={6}>6 Columns</option>
        </select>
      </div>

      <div>
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Image Style / Shape
        </label>
        <select
          value={settings.image_style || "rounded"}
          onChange={(e) => onChange({ image_style: e.target.value })}
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        >
          <option value="rounded">Rounded Rectangle</option>
          <option value="circle">Circle / Avatar</option>
          <option value="square">Square</option>
        </select>
      </div>

      <div>
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Display Variant
        </label>
        <select
          value={variant || "grid"}
          onChange={(e) => onVariantChange(e.target.value)}
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        >
          <option value="grid">Grid</option>
          <option value="circle">Circular Badges</option>
          <option value="list">Compact List</option>
        </select>
      </div>

      <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              Specific Categories
            </p>
            <p className="text-[11px] text-gray-500">
              {categoryIds.length > 0
                ? `${categoryIds.length} categories chosen`
                : "Showing all catalog categories"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px]"
          >
            Filter Categories
          </button>
        </div>
      </div>

      <MultiCategoryPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedIds={categoryIds}
        onChange={(ids) => onChange({ category_ids: ids })}
        maxSelect={12}
      />
    </div>
  );
}
