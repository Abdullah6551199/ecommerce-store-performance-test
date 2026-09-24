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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Select Categories
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

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">No categories found</div>
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
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100"
                        : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <span className="font-medium text-xs">{c.name}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="h-4 w-4 rounded text-blue-600"
                    />
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
