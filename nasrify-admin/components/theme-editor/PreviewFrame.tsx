"use client";

import React, { useEffect, useRef, useState } from "react";
import { DeviceMode } from "./TopBar";

interface PreviewFrameProps {
  themeConfig: any;
  device: DeviceMode;
  previewUrl?: string;
}

export function PreviewFrame({
  themeConfig,
  device,
  previewUrl = "https://nasrify-store.zia291930.workers.dev/?preview=1",
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);

  // Send theme updates to the iframe whenever themeConfig changes (debounced 300ms)
  useEffect(() => {
    if (!iframeLoaded || !iframeRef.current || !iframeRef.current.contentWindow) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "UPDATE_THEME",
            theme: themeConfig,
          },
          "*"
        );
      } catch (err) {
        // Safe postMessage
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [themeConfig, iframeLoaded]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIframeLoaded(true);
    // Send initial theme snapshot to iframe immediately
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_THEME",
          theme: themeConfig,
        },
        "*"
      );
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeLoaded(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Determine iframe container width based on device mode
  const getDeviceStyle = () => {
    switch (device) {
      case "tablet":
        return { width: "768px", maxWidth: "100%" };
      case "mobile":
        return { width: "375px", maxWidth: "100%" };
      case "desktop":
      default:
        return { width: "100%" };
    }
  };

  return (
    <main className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-3 overflow-hidden relative">
      {/* Top indicator bar for preview */}
      <div className="w-full flex items-center justify-between text-[11px] text-slate-500 mb-2 px-2 shrink-0">
        <div className="flex items-center gap-2">
          <span>Live Storefront Preview</span>
          {isLoading && (
            <span className="flex items-center gap-1 text-[#25D366]">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Connecting preview...</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono uppercase">{device}</span>
          <button
            type="button"
            onClick={handleReload}
            title="Reload preview iframe"
            className="hover:text-slate-300 p-0.5 rounded transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Frame container */}
      <div
        style={getDeviceStyle()}
        className="flex-1 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-800 transition-all duration-300 relative flex flex-col"
      >
        <iframe
          ref={iframeRef}
          src={previewUrl}
          onLoad={handleIframeLoad}
          title="Storefront Preview"
          className="w-full h-full border-none bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />

        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center text-slate-200 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <svg className="animate-spin h-4 w-4 text-[#25D366]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading storefront live preview...</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
