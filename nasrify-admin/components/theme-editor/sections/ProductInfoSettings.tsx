"use client";

import React from "react";

interface ProductInfoSettingsProps {
  settings: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export default function ProductInfoSettings({
  settings = {},
  variant = "standard",
  onChange,
  onVariantChange,
}: ProductInfoSettingsProps) {
  const showSku = settings.show_sku !== false;
  const showBrand = settings.show_brand !== false;
  const showRating = settings.show_rating !== false;
  const showCompare = settings.show_compare !== false;
  const showWishlist = settings.show_wishlist !== false;
  const buttonText = settings.button_text || "Add to Cart";
  const buttonStyle = settings.button_style || "primary";

  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="font-semibold text-slate-300">
          Add to Cart Button Text
        </label>
        <input
          type="text"
          value={buttonText}
          onChange={(e) => onChange({ button_text: e.target.value })}
          placeholder="Add to Cart"
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 focus:border-green-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="font-semibold text-slate-300">
          Button Style
        </label>
        <select
          value={buttonStyle}
          onChange={(e) => onChange({ button_style: e.target.value })}
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 focus:border-green-500 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
        >
          <option value="primary">Primary (Brand Accent)</option>
          <option value="secondary">Secondary (Muted / Slate)</option>
          <option value="outline">Outline</option>
        </select>
      </div>

      <div className="pt-2">
        <label className="font-semibold text-slate-300">
          Layout Variant
        </label>
        {onVariantChange && (
          <select
            value={variant}
            onChange={(e) => onVariantChange(e.target.value)}
            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 focus:border-green-500 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
          >
            <option value="standard">Standard (Side Details)</option>
            <option value="compact">Compact</option>
          </select>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800 space-y-2.5">
        <label className="font-semibold text-slate-200 block">
          Display Fields
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={showSku}
            onChange={(e) => onChange({ show_sku: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-green-500 focus:ring-0"
          />
          <span>Show SKU / Product Code</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={showBrand}
            onChange={(e) => onChange({ show_brand: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-green-500 focus:ring-0"
          />
          <span>Show Brand / Vendor</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={showRating}
            onChange={(e) => onChange({ show_rating: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-green-500 focus:ring-0"
          />
          <span>Show Star Ratings & Review Count</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={showCompare}
            onChange={(e) => onChange({ show_compare: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-green-500 focus:ring-0"
          />
          <span>Show Compare Button</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={showWishlist}
            onChange={(e) => onChange({ show_wishlist: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-green-500 focus:ring-0"
          />
          <span>Show Wishlist Heart Button</span>
        </label>
      </div>
    </div>
  );
}
