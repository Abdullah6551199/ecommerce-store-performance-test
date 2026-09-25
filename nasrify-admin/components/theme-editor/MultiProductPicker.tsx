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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-100">
              Select Products
            </h3>
            <p className="text-xs text-slate-400">
              Selected {tempSelected.length} of {maxSelect} max
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              loadProducts(e.target.value);
            }}
            placeholder="Search products by title..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No products found</div>
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
                        ? "border-green-500 bg-green-500/10 ring-1 ring-green-500"
                        : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
                    }`}
                  >
                    <div className="relative aspect-square w-full rounded bg-slate-900 overflow-hidden mb-2">
                      {thumb ? (
                        <img src={thumb} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                          No Image
                        </div>
                      )}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="absolute top-1.5 right-1.5 h-4 w-4 rounded text-green-500 bg-slate-900 border-slate-700"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-200 line-clamp-1">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-400">${p.price?.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950">
          <button
            type="button"
            onClick={() => setTempSelected([])}
            className="text-xs text-rose-400 hover:underline"
          >
            Clear All
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-xs font-semibold text-slate-950"
            >
              Apply Selection ({tempSelected.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
