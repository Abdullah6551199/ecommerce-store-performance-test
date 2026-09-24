"use client";

import React, { useState } from "react";
import MultiProductPicker from "../MultiProductPicker";

interface ProductGridSettingsProps {
  settings: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange: (variant: string) => void;
}

export default function ProductGridSettings({
  settings = {},
  variant = "standard",
  onChange,
  onVariantChange,
}: ProductGridSettingsProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const productIds = (settings.product_ids as string[]) || [];

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
          placeholder="Featured Products"
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Subheading
        </label>
        <input
          type="text"
          value={settings.subheading || ""}
          onChange={(e) => onChange({ subheading: e.target.value })}
          placeholder="Hand-picked favorites crafted for perfection"
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
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
          </select>
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            Rows
          </label>
          <select
            value={settings.rows || 2}
            onChange={(e) => onChange({ rows: parseInt(e.target.value, 10) })}
            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
          >
            <option value={1}>1 Row</option>
            <option value={2}>2 Rows</option>
            <option value={3}>3 Rows</option>
            <option value={4}>4 Rows</option>
          </select>
        </div>
      </div>

      <div>
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Display Variant
        </label>
        <select
          value={variant || "standard"}
          onChange={(e) => onVariantChange(e.target.value)}
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        >
          <option value="standard">Standard Grid</option>
          <option value="compact">Compact Grid</option>
          <option value="masonry">Masonry</option>
        </select>
      </div>

      {/* Manual Product Selection */}
      <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              Specific Products Filter
            </p>
            <p className="text-[11px] text-gray-500">
              {productIds.length > 0
                ? `${productIds.length} custom products selected`
                : "Showing default latest products"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px]"
          >
            {productIds.length > 0 ? "Edit Products" : "Pick Products"}
          </button>
        </div>

        {productIds.length > 0 && (
          <button
            type="button"
            onClick={() => onChange({ product_ids: [] })}
            className="text-[11px] text-red-500 hover:underline"
          >
            Reset to all products
          </button>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300 font-medium">
            Show Product Price
          </label>
          <input
            type="checkbox"
            checked={settings.show_price !== false}
            onChange={(e) => onChange({ show_price: e.target.checked })}
            className="h-4 w-4 rounded text-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300 font-medium">
            Show Ratings & Reviews
          </label>
          <input
            type="checkbox"
            checked={settings.show_rating !== false}
            onChange={(e) => onChange({ show_rating: e.target.checked })}
            className="h-4 w-4 rounded text-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300 font-medium">
            Show Add-to-Cart Button
          </label>
          <input
            type="checkbox"
            checked={settings.show_add_to_cart !== false}
            onChange={(e) => onChange({ show_add_to_cart: e.target.checked })}
            className="h-4 w-4 rounded text-blue-600"
          />
        </div>
      </div>

      <MultiProductPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedIds={productIds}
        onChange={(ids) => onChange({ product_ids: ids })}
        maxSelect={16}
      />
    </div>
  );
}
