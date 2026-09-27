"use client";

import React, { useState, useMemo } from "react";
import { ALL_COMPONENT_SCHEMAS } from "@/lib/themes/components";
import { ComponentSchema } from "@/lib/themes/component-schema";

export interface ComponentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComponent: (componentType: string) => void;
  allowedTypes?: string[];
  sectionName?: string;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  all: { label: "All Components", icon: "✨" },
  basic: { label: "Basic", icon: "🧱" },
  ecommerce: { label: "E-Commerce", icon: "🛍️" },
  form: { label: "Forms", icon: "📝" },
  media: { label: "Media", icon: "🎬" },
  content: { label: "Core", icon: "📄" },
};

export function ComponentPicker({
  isOpen,
  onClose,
  onSelectComponent,
  allowedTypes,
  sectionName,
}: ComponentPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredComponents = useMemo(() => {
    let list = ALL_COMPONENT_SCHEMAS;

    // Filter by allowed types if specified
    if (allowedTypes && allowedTypes.length > 0) {
      list = list.filter((c) => allowedTypes.includes(c.type));
    }

    // Filter by category
    if (selectedCategory !== "all") {
      list = list.filter((c) => c.category === selectedCategory);
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allowedTypes, selectedCategory, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="text-emerald-400">🧩</span>
              <span>Insert Component</span>
              {sectionName && (
                <span className="text-xs font-normal text-slate-400">
                  into <strong className="text-slate-200">{sectionName}</strong>
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose from 32+ Elementor-style components to place inside this section
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 space-y-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components (e.g. Button, Countdown, Video, Tabs)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Categories Tab Strip */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
            {Object.entries(CATEGORY_LABELS).map(([catKey, { label, icon }]) => {
              const isActive = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-md font-semibold"
                      : "bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Component Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredComponents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <span className="text-3xl block">🔍</span>
              <p className="text-xs">No components match your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredComponents.map((comp) => (
                <button
                  key={comp.type}
                  type="button"
                  onClick={() => {
                    onSelectComponent(comp.type);
                    onClose();
                  }}
                  className="group flex flex-col items-start p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all text-left relative overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 w-full mb-1.5">
                    <span className="text-xl p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:scale-110 group-hover:border-emerald-500/30 transition-transform">
                      {comp.icon || "🧩"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-slate-100 group-hover:text-emerald-400 transition-colors truncate">
                        {comp.label}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                        {comp.category}
                      </span>
                    </div>
                  </div>
                  {comp.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {comp.description}
                    </p>
                  )}
                  <span className="mt-2 text-[10px] font-medium text-emerald-400/80 group-hover:text-emerald-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>+ Insert</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredComponents.length} components available</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComponentPicker;
