"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { loadCuratedAdminFonts, CURATED_FONTS } from "@/lib/fonts/load-fonts";

export interface FontOption {
  slug: string;
  family: string;
  category: string;
}

const FALLBACK_FONTS: FontOption[] = CURATED_FONTS.map((f) => ({
  slug: f.family.toLowerCase().replace(/\s+/g, "-"),
  family: f.family,
  category: f.category,
}));

const CATEGORIES = ["All", "sans", "serif", "display", "handwriting", "mono"];

export interface FontPickerProps {
  label: string;
  value: string;
  onChange: (family: string) => void;
  description?: string;
}

export function FontPicker({ label, value, onChange, description }: FontPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fonts, setFonts] = useState<FontOption[]>(FALLBACK_FONTS);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [modalSearch, setModalSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 280,
  });

  // Load curated fonts CSS in admin document on mount (Stage 47.1 - BUG-4)
  useEffect(() => {
    setMounted(true);
    loadCuratedAdminFonts();
  }, []);

  // Calculate dropdown coordinates when opened
  const updateCoords = () => {
    if (typeof window === "undefined") return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = Math.max(rect.width, 280);
      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth - 16) {
        left = window.innerWidth - dropdownWidth - 16;
      }
      let top = rect.bottom + 4;
      if (top + 340 > window.innerHeight - 16) {
        top = Math.max(16, rect.top - 344);
      }
      setCoords({
        top,
        left,
        width: dropdownWidth,
      });
    }
  };

  const handleOpenDropdown = () => {
    updateCoords();
    setIsDropdownOpen(true);
  };

  // Close dropdown on outside click or Esc
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, true);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [isDropdownOpen]);

  const filteredDropdownFonts = useMemo(() => {
    let list = fonts;
    if (selectedCategory !== "All") {
      list = list.filter((f) => f.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (dropdownSearch.trim()) {
      const q = dropdownSearch.toLowerCase().trim();
      list = list.filter((f) => f.family.toLowerCase().includes(q));
    }
    return list;
  }, [fonts, selectedCategory, dropdownSearch]);

  const filteredModalFonts = useMemo(() => {
    let list = fonts;
    if (selectedCategory !== "All") {
      list = list.filter((f) => f.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase().trim();
      list = list.filter((f) => f.family.toLowerCase().includes(q));
    }
    return list;
  }, [fonts, selectedCategory, modalSearch]);

  const currentDisplay = value || "Inter";

  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between">
        <label className="text-slate-300 font-medium">{label}</label>
        {description && <span className="text-[10px] text-slate-500">{description}</span>}
      </div>

      {/* Trigger Button showing current font styled in its typeface */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpenDropdown}
        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-100 flex items-center justify-between hover:border-emerald-500/60 hover:bg-slate-750 transition-all text-left"
      >
        <span
          style={{ fontFamily: `"${currentDisplay}", sans-serif` }}
          className="font-semibold text-sm text-slate-100 truncate"
        >
          {currentDisplay}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          <span className="text-[11px] text-emerald-400 font-medium">Change</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Portal Dropdown Menu (Stage 47.1 - BUG-5) */}
      {mounted &&
        isDropdownOpen &&
        typeof document !== "undefined" &&
        document.body &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 9999,
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[340px] animate-in fade-in duration-100"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-slate-800 bg-slate-950/60">
              <input
                type="text"
                value={dropdownSearch}
                onChange={(e) => setDropdownSearch(e.target.value)}
                placeholder="Search font family..."
                autoFocus
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 p-2 border-b border-slate-800/80 overflow-x-auto custom-scrollbar bg-slate-950/30">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize shrink-0 transition-colors ${
                    selectedCategory === cat
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scrollable Font List with Live Typeface Previews */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
              {filteredDropdownFonts.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">No fonts found</div>
              ) : (
                filteredDropdownFonts.map((f) => {
                  const isSelected = f.family.toLowerCase() === currentDisplay.toLowerCase();
                  return (
                    <button
                      key={f.slug}
                      type="button"
                      onClick={() => {
                        onChange(f.family);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full p-2 rounded-lg text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-200"
                          : "hover:bg-slate-800 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-xs text-slate-100">{f.family}</span>
                        <span className="text-[9px] uppercase font-mono text-slate-500">{f.category}</span>
                      </div>
                      <span
                        style={{ fontFamily: `"${f.family}", sans-serif` }}
                        className="text-sm text-slate-300 truncate mt-0.5"
                      >
                        The quick brown fox jumps
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom Bar: Browse All Button */}
            <div className="p-2 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🔍</span>
                <span>Browse All Fonts (Grid Modal)</span>
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Full Grid Modal (Stage 47.1 - Elementor-Style Upgrade) */}
      {mounted &&
        isModalOpen &&
        typeof document !== "undefined" &&
        document.body &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>🔤</span>
                    <span>Select Typography: {label}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Curated high-performance web typography loaded for live storefront rendering
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Filter and Search Bar */}
              <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto custom-scrollbar">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                        selectedCategory === cat
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    placeholder="Search font family..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Fonts Grid */}
              <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 flex-1 custom-scrollbar">
                {filteredModalFonts.map((f) => {
                  const isSelected = f.family.toLowerCase() === currentDisplay.toLowerCase();
                  return (
                    <div
                      key={f.slug}
                      onClick={() => {
                        onChange(f.family);
                        setIsModalOpen(false);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-200 shadow-lg ring-1 ring-emerald-500"
                          : "bg-slate-950/50 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-slate-100">{f.family}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {f.category}
                        </span>
                      </div>

                      <p
                        style={{ fontFamily: `"${f.family}", sans-serif` }}
                        className="text-base text-slate-100 my-2 truncate leading-snug"
                      >
                        The quick brown fox jumps over the lazy dog
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
                        <span>WebFont</span>
                        {isSelected ? (
                          <span className="text-emerald-400 font-bold">Selected ✓</span>
                        ) : (
                          <span className="text-slate-500 group-hover:text-slate-300">Click to Select</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredModalFonts.length === 0 && (
                  <div className="col-span-full text-center py-12 text-xs text-slate-500">
                    No matching fonts found for &quot;{modalSearch}&quot;.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
                <span>{filteredModalFonts.length} fonts available</span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default FontPicker;
