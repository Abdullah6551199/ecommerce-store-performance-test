"use client";

import React, { useState, useEffect } from "react";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  images?: string[];
}

interface MultiProductPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxSelect?: number;
}

export default function MultiProductPicker({
  isOpen,
  onClose,
  selectedIds = [],
  onChange,
  maxSelect = 16,
}: MultiProductPickerProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tempSelected, setTempSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedIds);
      loadProducts("");
    }
  }, [isOpen]);

  const loadProducts = async (q: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/products?limit=50&search=${encodeURIComponent(q)}`);
      const data: any = await res.json();
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (data.data && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    if (tempSelected.includes(id)) {
      setTempSelected(tempSelected.filter((item) => item !== id));
    } else {
      if (tempSelected.length >= maxSelect) return;
      setTempSelected([...tempSelected, id]);
    }
  };

  const handleApply = () => {
    onChange(tempSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Select Products
            </h3>
            <p className="text-xs text-gray-500">
              Selected {tempSelected.length} of {maxSelect} max
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              loadProducts(e.target.value);
            }}
            placeholder="Search products by title..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">No products found</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((p) => {
                const isSelected = tempSelected.includes(p.id);
                const thumb = p.imageUrl || (p.images && p.images[0]) || "";
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    className={`cursor-pointer rounded-lg border p-2 flex flex-col justify-between transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-600"
                        : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <div className="relative aspect-square w-full rounded bg-gray-100 dark:bg-zinc-800 overflow-hidden mb-2">
                      {thumb ? (
                        <img src={thumb} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                          No Image
                        </div>
                      )}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="absolute top-1.5 right-1.5 h-4 w-4 rounded text-blue-600"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-gray-900 dark:text-white line-clamp-1">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-gray-500">${p.price?.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => setTempSelected([])}
            className="text-xs text-red-500 hover:underline"
          >
            Clear All
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs"
            >
              Apply Selection ({tempSelected.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
