"use client";

import React, { useState } from "react";

interface ThemeDetailTabsProps {
  livePreview: React.ReactNode;
  galleryAndTokens: React.ReactNode;
  changelog?: React.ReactNode;
  reviews: React.ReactNode;
}

export function ThemeDetailTabs({
  livePreview,
  galleryAndTokens,
  changelog,
  reviews,
}: ThemeDetailTabsProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"preview" | "details" | "changelog" | "reviews">("preview");

  return (
    <div id="live-preview" className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "preview"
              ? "bg-[#960DF2] text-white shadow-md shadow-purple-500/20"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <span>👁️</span>
          <span>Live Preview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "details"
              ? "bg-[#960DF2] text-white shadow-md shadow-purple-500/20"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <span>🎨</span>
          <span>Design System &amp; Gallery</span>
        </button>

        {changelog && (
          <button
            type="button"
            onClick={() => setActiveTab("changelog")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "changelog"
                ? "bg-[#960DF2] text-white shadow-md shadow-purple-500/20"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span>📜</span>
            <span>Changelog</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "reviews"
              ? "bg-[#960DF2] text-white shadow-md shadow-purple-500/20"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <span>⭐</span>
          <span>Customer Reviews</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "preview" && (
          <div className="space-y-4 animate-fadeIn">
            {livePreview}
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-10 animate-fadeIn">
            {galleryAndTokens}
          </div>
        )}

        {activeTab === "changelog" && changelog && (
          <div className="space-y-4 animate-fadeIn">
            {changelog}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4 animate-fadeIn">
            {reviews}
          </div>
        )}
      </div>
    </div>
  );
}
