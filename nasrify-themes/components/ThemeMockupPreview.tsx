"use client";

import React, { useState } from "react";
import type { ThemeMarketplaceListing, ThemeConfig } from "@/types/themes";

interface ThemeMockupPreviewProps {
  theme: ThemeMarketplaceListing | {
    name: string;
    themeId: string;
    author?: string | null;
    version?: string;
    configJson?: string | null;
    previewUrl?: string | null;
    category?: string | null;
  };
  onClose?: () => void;
  isModal?: boolean;
}

export function ThemeMockupPreview({ theme, onClose, isModal = false }: ThemeMockupPreviewProps): React.JSX.Element {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  let config: ThemeConfig = {};
  if (theme.configJson) {
    try {
      config = JSON.parse(theme.configJson);
    } catch {
      config = {};
    }
  }

  const primaryColor = config.colors?.primary || "#780AC2";
  const secondaryColor = config.colors?.secondary || "#960DF2";
  const accentColor = config.colors?.accent || "#C06EF7";
  const bgColor = config.colors?.background || "#FAFAFA";
  const surfaceColor = config.colors?.surface || "#FFFFFF";
  const textColor = config.colors?.text || "#18181B";
  const headingFont = config.typography?.headingFont || "inherit";
  const bodyFont = config.typography?.bodyFont || "inherit";
  const borderRadius = config.layout?.borderRadius || "12px";

  const containerWidthClass =
    device === "mobile" ? "max-w-[375px]" : device === "tablet" ? "max-w-[680px]" : "max-w-full";

  const content = (
    <div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">
      {/* Browser chrome header */}
      <div className="bg-zinc-200/80 dark:bg-zinc-800/90 px-4 py-2.5 flex items-center justify-between border-b border-zinc-300 dark:border-zinc-700 select-none">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
          <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
          <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono ml-2 truncate max-w-[200px]">
            preview.nasrify.com/{theme.themeId}
          </span>
        </div>

        {/* Device toggle */}
        <div className="flex items-center gap-1 bg-zinc-300/60 dark:bg-zinc-700/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`px-2 py-0.5 text-xs font-semibold rounded ${
              device === "desktop" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            🖥️ Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            className={`px-2 py-0.5 text-xs font-semibold rounded ${
              device === "tablet" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            📱 Tablet
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`px-2 py-0.5 text-xs font-semibold rounded ${
              device === "mobile" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            📲 Mobile
          </button>
        </div>

        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-sm font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Simulated Storefront Container */}
      <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-zinc-200/50 dark:bg-zinc-950/50">
        <div
          className={`w-full transition-all duration-300 ${containerWidthClass} shadow-2xl rounded-2xl overflow-hidden border border-black/5`}
          style={{
            backgroundColor: bgColor,
            color: textColor,
            fontFamily: bodyFont,
          }}
        >
          {/* Top Announcement Bar */}
          <div
            className="px-4 py-2 text-center text-xs font-medium text-white transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            Free worldwide shipping on orders over $50 • Previewing <strong>{theme.name}</strong>
          </div>

          {/* Storefront Header */}
          <header
            className="px-6 py-4 flex items-center justify-between border-b"
            style={{
              backgroundColor: surfaceColor,
              borderColor: "rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                style={{ backgroundColor: primaryColor, borderRadius }}
              >
                ✦
              </span>
              <span
                className="font-extrabold text-lg tracking-tight"
                style={{ fontFamily: headingFont }}
              >
                APEX STORE
              </span>
            </div>
            <nav className="hidden sm:flex items-center gap-6 text-xs font-semibold opacity-80">
              <span className="hover:opacity-100 cursor-pointer">Shop</span>
              <span className="hover:opacity-100 cursor-pointer">Collections</span>
              <span className="hover:opacity-100 cursor-pointer">Stories</span>
            </nav>
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer text-white shadow-sm"
                style={{ backgroundColor: primaryColor, borderRadius }}
              >
                Bag (2)
              </span>
            </div>
          </header>

          {/* Hero Banner */}
          <section className="p-6 sm:p-10 text-center relative overflow-hidden">
            <div
              className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4 rounded-full"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
              }}
            >
              {theme.category || "Featured Collection"} Edition
            </div>
            <h1
              className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3"
              style={{ fontFamily: headingFont }}
            >
              Designed for Speed &amp; Elegance.
            </h1>
            <p className="text-xs sm:text-sm max-w-md mx-auto opacity-75 mb-6">
              Experience edge-speed retail rendered instantly across 300+ global Cloudflare locations.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                className="px-5 py-2.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: primaryColor, borderRadius }}
              >
                Explore Catalog
              </button>
              <button
                type="button"
                className="px-5 py-2.5 text-xs font-bold border transition-colors"
                style={{
                  borderColor: primaryColor,
                  color: primaryColor,
                  borderRadius,
                }}
              >
                Learn More
              </button>
            </div>
          </section>

          {/* Showcase Product Grid */}
          <section className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-base font-bold"
                style={{ fontFamily: headingFont }}
              >
                Trending Now
              </h2>
              <span className="text-xs font-medium opacity-60">View all &rarr;</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: "p1",
                  name: "Minimalist Aero Jacket",
                  price: "$149.00",
                  tag: "Bestseller",
                  bg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                },
                {
                  id: "p2",
                  name: "Ceramic Smart Watch",
                  price: "$289.00",
                  tag: "New Arrival",
                  bg: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
                },
                {
                  id: "p3",
                  name: "Sleek Carbon Daypack",
                  price: "$89.00",
                  tag: "Limited",
                  bg: "linear-gradient(135deg, #475569 0%, #334155 100%)",
                },
              ].map((prod) => (
                <div
                  key={prod.id}
                  className="p-4 border shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
                  style={{
                    backgroundColor: surfaceColor,
                    borderColor: "rgba(0,0,0,0.06)",
                    borderRadius,
                  }}
                >
                  <div
                    className="h-32 rounded-xl mb-3 flex items-center justify-center text-white text-3xl shadow-inner relative"
                    style={{ background: prod.bg }}
                  >
                    <span
                      className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {prod.tag}
                    </span>
                    🛍️
                  </div>
                  <div>
                    <h3
                      className="text-xs font-bold truncate"
                      style={{ fontFamily: headingFont }}
                    >
                      {prod.name}
                    </h3>
                    <p className="text-xs font-black mt-1" style={{ color: primaryColor }}>
                      {prod.price}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="w-full mt-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                    style={{ backgroundColor: secondaryColor, borderRadius }}
                  >
                    Add to Bag
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Color palette debug footer */}
          <div
            className="px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs"
            style={{
              backgroundColor: surfaceColor,
              borderColor: "rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[11px] opacity-70">Palette:</span>
              <span
                className="h-4 w-4 rounded-full border border-black/10 shadow-sm inline-block"
                style={{ backgroundColor: primaryColor }}
                title={`Primary: ${primaryColor}`}
              />
              <span
                className="h-4 w-4 rounded-full border border-black/10 shadow-sm inline-block"
                style={{ backgroundColor: secondaryColor }}
                title={`Secondary: ${secondaryColor}`}
              />
              <span
                className="h-4 w-4 rounded-full border border-black/10 shadow-sm inline-block"
                style={{ backgroundColor: accentColor }}
                title={`Accent: ${accentColor}`}
              />
              <span
                className="h-4 w-4 rounded-full border border-black/10 shadow-sm inline-block"
                style={{ backgroundColor: surfaceColor }}
                title={`Surface: ${surfaceColor}`}
              />
              <span
                className="h-4 w-4 rounded-full border border-black/10 shadow-sm inline-block"
                style={{ backgroundColor: bgColor }}
                title={`Background: ${bgColor}`}
              />
            </div>
            <div className="text-[11px] opacity-60 font-mono">
              Font: {headingFont || "Sans"} / {bodyFont || "Sans"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-5xl h-[85vh]">{content}</div>
    </div>
  );
}
