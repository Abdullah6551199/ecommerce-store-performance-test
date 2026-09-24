"use client";

import React, { useState, useEffect } from "react";

interface FontOption {
  slug: string;
  family: string;
  category: string;
  is_curated: boolean;
}

const FALLBACK_CURATED_FONTS: FontOption[] = [
  { slug: "inter", family: "Inter", category: "sans", is_curated: true },
  { slug: "poppins", family: "Poppins", category: "sans", is_curated: true },
  { slug: "roboto", family: "Roboto", category: "sans", is_curated: true },
  { slug: "open-sans", family: "Open Sans", category: "sans", is_curated: true },
  { slug: "lato", family: "Lato", category: "sans", is_curated: true },
  { slug: "montserrat", family: "Montserrat", category: "sans", is_curated: true },
  { slug: "raleway", family: "Raleway", category: "sans", is_curated: true },
  { slug: "dm-sans", family: "DM Sans", category: "sans", is_curated: true },
  { slug: "manrope", family: "Manrope", category: "sans", is_curated: true },
  { slug: "plus-jakarta-sans", family: "Plus Jakarta Sans", category: "sans", is_curated: true },
  { slug: "outfit", family: "Outfit", category: "sans", is_curated: true },
  { slug: "playfair-display", family: "Playfair Display", category: "serif", is_curated: true },
  { slug: "merriweather", family: "Merriweather", category: "serif", is_curated: true },
  { slug: "lora", family: "Lora", category: "serif", is_curated: true },
  { slug: "cormorant-garamond", family: "Cormorant Garamond", category: "serif", is_curated: true },
  { slug: "libre-baskerville", family: "Libre Baskerville", category: "serif", is_curated: true },
  { slug: "bebas-neue", family: "Bebas Neue", category: "display", is_curated: true },
  { slug: "anton", family: "Anton", category: "display", is_curated: true },
  { slug: "caveat", family: "Caveat", category: "handwriting", is_curated: true },
  { slug: "pacifico", family: "Pacifico", category: "handwriting", is_curated: true },
  { slug: "jetbrains-mono", family: "JetBrains Mono", category: "mono", is_curated: true },
];

const CATEGORIES = ["All", "sans", "serif", "display", "handwriting", "mono"];

interface FontPickerProps {
  label: string;
  value: string;
  onChange: (family: string) => void;
  description?: string;
}

export function FontPicker({ label, value, onChange, description }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fonts, setFonts] = useState<FontOption[]>(FALLBACK_CURATED_FONTS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch fonts list on mount
  useEffect(() => {
    async function loadFonts() {
      try {
        const res = await fetch("/api/admin/fonts?curated=1");
        if (res.ok) {
          const data = (await res.json()) as any;
          if (Array.isArray(data?.fonts) && data.fonts.length > 0) {
            setFonts(data.fonts);
          }
        }
      } catch {
        // Safe fallback to preset fonts
      }
    }
    loadFonts();
  }, []);

  const filteredFonts = fonts.filter((f) => {
    const matchesCategory =
      selectedCategory === "All" || f.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = f.family.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentDisplay = value || "Inter";

  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between">
        <label className="text-gray-600 dark:text-gray-400 font-medium">{label}</label>
        {description && <span className="text-[10px] text-gray-400">{description}</span>}
      </div>

      {/* Picker trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white flex items-center justify-between hover:border-indigo-500/50 transition-colors"
      >
        <span style={{ fontFamily: `"${currentDisplay}", sans-serif` }} className="font-semibold text-sm">
          {currentDisplay}
        </span>
        <span className="text-[11px] text-indigo-500 font-medium">Browse Fonts →</span>
      </button>

      {/* Font Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  Select {label}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Curated zero-latency R2 web typography
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search fonts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Fonts Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 custom-scrollbar">
              {filteredFonts.map((f) => {
                const isSelected = f.family.toLowerCase() === currentDisplay.toLowerCase();
                return (
                  <div
                    key={f.slug}
                    onClick={() => {
                      onChange(f.family);
                      setIsOpen(false);
                    }}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md"
                        : "bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-slate-100">{f.family}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {f.category}
                      </span>
                    </div>

                    <p
                      style={{ fontFamily: `"${f.family}", sans-serif` }}
                      className="text-base text-slate-100 my-1 truncate leading-snug"
                    >
                      The quick brown fox jumps
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800/60">
                      <span>R2 Local WebFont</span>
                      {isSelected && <span className="text-indigo-400 font-bold">Selected ✓</span>}
                    </div>
                  </div>
                );
              })}

              {filteredFonts.length === 0 && (
                <div className="col-span-2 text-center py-8 text-xs text-slate-500">
                  No matching fonts found for &quot;{searchTerm}&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FontPicker;
