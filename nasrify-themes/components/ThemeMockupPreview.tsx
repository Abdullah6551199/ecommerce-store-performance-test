"use client";

import React, { useState, useRef } from "react";
import type { ThemeMarketplaceListing, ThemeConfig } from "@/types/themes";

interface ThemeMockupPreviewProps {
  theme: ThemeMarketplaceListing | {
    name: string;
    themeId: string;
    slug?: string | null;
    author?: string | null;
    version?: string;
    configJson?: string | null;
    previewUrl?: string | null;
    category?: string | null;
  };
  onClose?: () => void;
  isModal?: boolean;
}

export function ThemeMockupPreview({
  theme,
  onClose,
  isModal = false,
}: ThemeMockupPreviewProps): React.JSX.Element {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const storefrontBase =
    process.env.NEXT_PUBLIC_STOREFRONT_URL || "https://nasrify-store.zia291930.workers.dev";
  const themeSlug =
    ("slug" in theme && theme.slug) ? theme.slug : theme.themeId;
  const previewUrl = `${storefrontBase}/?preview_theme=${encodeURIComponent(themeSlug)}`;

  const containerWidthClass =
    device === "mobile"
      ? "w-[375px] max-w-full"
      : device === "tablet"
      ? "w-[768px] max-w-full"
      : "w-full max-w-full";

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const content = (
    <div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">
      {/* Browser Chrome Header */}
      <div className="bg-zinc-200/90 dark:bg-zinc-800/90 px-4 py-2.5 flex flex-wrap items-center justify-between border-b border-zinc-300 dark:border-zinc-700 select-none gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
          </div>

          {/* Simulated address bar */}
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 font-mono ml-2 max-w-xs sm:max-w-md truncate shadow-2xs">
            <span className="text-emerald-500 shrink-0">🔒</span>
            <span className="truncate">
              nasrify-store.workers.dev/?preview_theme={themeSlug}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            title="Reload preview"
            className="p-1 rounded text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition-colors text-xs"
          >
            🔄
          </button>

          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new window"
            className="p-1 rounded text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50 transition-colors text-xs flex items-center gap-1"
          >
            <span>↗</span>
            <span className="hidden md:inline text-[11px] font-sans font-medium">Full Tab</span>
          </a>
        </div>

        {/* Device toggle */}
        <div className="flex items-center gap-1 bg-zinc-300/70 dark:bg-zinc-700/70 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              device === "desktop"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            🖥️ Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              device === "tablet"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            📱 Tablet
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              device === "mobile"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
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

      {/* Live Storefront Iframe Container */}
      <div className="p-2 sm:p-4 overflow-hidden flex-1 flex justify-center bg-zinc-200/50 dark:bg-zinc-950/50 relative">
        <div
          className={`h-full transition-all duration-300 ${containerWidthClass} shadow-2xl rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-800 bg-white relative flex flex-col`}
        >
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs transition-opacity">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Rendering {theme.name} live from storefront...
              </span>
            </div>
          )}

          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={previewUrl}
            title={`${theme.name} Live Storefront Preview`}
            className="w-full h-full border-0 bg-white"
            onLoad={() => setIsLoading(false)}
            loading="eager"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-6xl h-[90vh]">{content}</div>
    </div>
  );
}
