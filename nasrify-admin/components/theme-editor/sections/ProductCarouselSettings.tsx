"use client";

import React, { useState } from "react";
import MultiProductPicker from "../MultiProductPicker";

interface ProductCarouselSettingsProps {
  settings: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange: (variant: string) => void;
}

export default function ProductCarouselSettings({
  settings = {},
  variant = "scroll",
  onChange,
  onVariantChange,
}: ProductCarouselSettingsProps) {
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
          placeholder="New Arrivals"
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        />
      </div>

      <div className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              Carousel Products
            </p>
            <p className="text-[11px] text-gray-500">
              {productIds.length > 0
                ? `${productIds.length} custom products selected`
                : "Showing latest store items"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px]"
          >
            Pick Products
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300 font-medium">
            Autoplay Carousel
          </label>
          <input
            type="checkbox"
            checked={Boolean(settings.autoplay)}
            onChange={(e) => onChange({ autoplay: e.target.checked })}
            className="h-4 w-4 rounded text-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300 font-medium">
            Show Navigation Arrows
          </label>
          <input
            type="checkbox"
            checked={settings.show_arrows !== false}
            onChange={(e) => onChange({ show_arrows: e.target.checked })}
            className="h-4 w-4 rounded text-blue-600"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300 font-medium">
            Show Indicator Dots
          </label>
          <input
            type="checkbox"
            checked={settings.show_dots !== false}
            onChange={(e) => onChange({ show_dots: e.target.checked })}
            className="h-4 w-4 rounded text-blue-600"
          />
        </div>
      </div>

      <div className="pt-2">
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Carousel Style Variant
        </label>
        <select
          value={variant || "scroll"}
          onChange={(e) => onVariantChange(e.target.value)}
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        >
          <option value="scroll">Smooth Scroll Bar</option>
          <option value="cards">Card Slider</option>
        </select>
      </div>

      <MultiProductPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedIds={productIds}
        onChange={(ids) => onChange({ product_ids: ids })}
        maxSelect={12}
      />
    </div>
  );
}
