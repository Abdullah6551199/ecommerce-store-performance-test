"use client";

import React, { useState } from "react";
import { SectionProps } from "@/lib/themes/types";
import Button from "../blocks/Button";

export interface CategoryFiltersSettings {
  position?: "sidebar" | "top";
  sticky?: boolean;
  show_price?: boolean;
  show_categories?: boolean;
  show_attributes?: boolean;
}

export default function CategoryFilters({
  variant = "sidebar",
  settings = {},
  storeData,
}: SectionProps<CategoryFiltersSettings>) {
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const showPrice = settings.show_price !== false;
  const showCats = settings.show_categories !== false;
  const showAttrs = settings.show_attributes !== false;

  const categories = storeData?.categories || [
    { id: "all", name: "All Products", count: 48 },
    { id: "furniture", name: "Chairs & Desks", count: 18 },
    { id: "lighting", name: "Lamps & Lighting", count: 12 },
    { id: "accessories", name: "Desktop Accessories", count: 18 },
  ];

  const isHorizontal = variant === "horizontal" || settings.position === "top";

  if (isHorizontal) {
    return (
      <div className="w-full py-3 mb-6 border-b border-[var(--theme-border,#E4E4E7)] flex flex-wrap items-center justify-between gap-4 font-[family-name:var(--theme-font-body)] text-xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map((c: any) => {
            const active = selectedCat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCat(c.id)}
                style={{
                  borderRadius: "var(--theme-radius, 8px)",
                  backgroundColor: active
                    ? "var(--theme-primary, #25D366)"
                    : "var(--theme-surface, #F4F4F5)",
                  color: active ? "#FFFFFF" : "var(--theme-text, #18181B)",
                }}
                className="px-3 py-1.5 font-medium whitespace-nowrap cursor-pointer transition-colors"
              >
                {c.name} ({c.count || 0})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-[var(--theme-text,#18181B)]">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-[var(--theme-border,#E4E4E7)] text-[var(--theme-primary,#25D366)] focus:ring-0"
            />
            In Stock Only
          </label>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-6 font-[family-name:var(--theme-font-body)]">
      {/* Categories */}
      {showCats && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text,#18181B)] mb-3">
            Collections
          </h3>
          <div className="space-y-1">
            {categories.map((c: any) => {
              const active = selectedCat === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCat(c.id)}
                  className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-[var(--theme-radius,8px)] transition-colors text-left cursor-pointer ${
                    active
                      ? "bg-[var(--theme-primary-light,#DCFCE7)] text-[var(--theme-primary-dark,#1EA855)] font-bold"
                      : "text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)] hover:bg-[var(--theme-surface,#F4F4F5)]"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="opacity-60 text-[11px]">{c.count || 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price filter */}
      {showPrice && (
        <div className="pt-4 border-t border-[var(--theme-border,#E4E4E7)]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text,#18181B)]">
              Max Price
            </h3>
            <span className="text-xs font-bold text-[var(--theme-primary,#25D366)]">
              ${maxPrice}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={1000}
            step={10}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-[var(--theme-primary,#25D366)] cursor-pointer"
          />
        </div>
      )}

      {/* Attributes / In stock */}
      {showAttrs && (
        <div className="pt-4 border-t border-[var(--theme-border,#E4E4E7)] space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text,#18181B)] mb-2">
            Availability
          </h3>
          <label className="flex items-center gap-2 text-xs text-[var(--theme-text,#18181B)] cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-[var(--theme-border,#E4E4E7)] text-[var(--theme-primary,#25D366)] focus:ring-0"
            />
            In Stock Only
          </label>
        </div>
      )}
    </aside>
  );
}
