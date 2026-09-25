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
        <label className="font-semibold text-slate-300">
          Section Heading
        </label>
        <input
          type="text"
          value={settings.heading || ""}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="New Arrivals"
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 focus:border-green-500 focus:outline-none"
        />
      </div>

      <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-200">
              Carousel Products
            </p>
            <p className="text-[11px] text-slate-400">
              {productIds.length > 0
                ? `${productIds.length} custom products selected`
                : "Showing latest store items"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="px-2.5 py-1 rounded bg-green-600 hover:bg-green-500 text-slate-950 font-bold text-[11px]"
          >
            Pick Products
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-slate-300 font-medium">
            Autoplay Carousel
          </label>
          <input
            type="checkbox"
            checked={Boolean(settings.autoplay)}
            onChange={(e) => onChange({ autoplay: e.target.checked })}
            className="h-4 w-4 rounded text-green-500 bg-slate-900 border-slate-700"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-slate-300 font-medium">
            Show Navigation Arrows
          </label>
          <input
            type="checkbox"
            checked={settings.show_arrows !== false}
            onChange={(e) => onChange({ show_arrows: e.target.checked })}
            className="h-4 w-4 rounded text-green-500 bg-slate-900 border-slate-700"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-slate-300 font-medium">
            Show Indicator Dots
          </label>
          <input
            type="checkbox"
            checked={settings.show_dots !== false}
            onChange={(e) => onChange({ show_dots: e.target.checked })}
            className="h-4 w-4 rounded text-green-500 bg-slate-900 border-slate-700"
          />
        </div>
      </div>

      <div className="pt-2">
        <label className="font-semibold text-slate-300">
          Carousel Style Variant
        </label>
        <select
          value={variant || "scroll"}
          onChange={(e) => onVariantChange(e.target.value)}
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 focus:border-green-500 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
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
