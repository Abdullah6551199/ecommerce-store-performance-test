"use client";

import React, { useState, useEffect } from "react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface MultiCategoryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxSelect?: number;
}

export default function MultiCategoryPicker({
  isOpen,
  onClose,
  selectedIds = [],
  onChange,
  maxSelect = 12,
}: MultiCategoryPickerProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedIds);
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const data: any = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else if (data.data && Array.isArray(data.data)) {
        setCategories(data.data);
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
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-100">
              Select Categories
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

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No categories found</div>
          ) : (
            <div className="space-y-1.5">
              {categories.map((c) => {
                const isSelected = tempSelected.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleSelect(c.id)}
                    className={`cursor-pointer rounded-lg border px-3 py-2 flex items-center justify-between transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-500/10 text-green-300"
                        : "border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-200"
                    }`}
                  >
                    <span className="font-medium text-xs">{c.name}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="h-4 w-4 rounded text-green-500 bg-slate-900 border-slate-700"
                    />
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
