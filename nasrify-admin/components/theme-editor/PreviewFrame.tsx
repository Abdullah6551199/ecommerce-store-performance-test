"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { DeviceMode } from "./TopBar";

interface PreviewFrameProps {
  themeConfig: any;
  device: DeviceMode;
  pageType?: string;
  previewUrl?: string;
  forceRefreshTrigger?: number;
  onInlineEdit?: (sectionId: string, field: string, value: string) => void;
  onSelectSection?: (sectionId: string) => void;
  onEditComponent?: (sectionId: string, componentId: string, componentType: string) => void;
  onDeleteComponent?: (sectionId: string, componentId: string) => void;
}

export function PreviewFrame({
  themeConfig,
  device,
  pageType = "homepage",
  previewUrl = "https://nasrify-store.zia291930.workers.dev/?preview=1",
  forceRefreshTrigger = 0,
  onInlineEdit,
  onSelectSection,
  onEditComponent,
  onDeleteComponent,
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);

  // Message queue for messages queued before iframe ready
  const messageQueueRef = useRef<any[]>([]);
  const isReadyRef = useRef<boolean>(false);

  // Derive full URL with page query parameter
  const baseStoreUrl = previewUrl.split("?")[0];
  const effectiveIframeSrc = `${baseStoreUrl}?preview=1&page=${pageType}`;

  const flushQueue = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;
    while (messageQueueRef.current.length > 0) {
      const msg = messageQueueRef.current.shift();
      try {
        iframeRef.current.contentWindow.postMessage(msg, "*");
      } catch (err) {}
    }
  }, []);

  const sendToIframe = useCallback((msg: any) => {
    if (isReadyRef.current && iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(msg, "*");
      } catch (err) {}
    } else {
      messageQueueRef.current.push(msg);
    }
  }, []);

  // Listen for iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "INLINE_EDIT") {
        const { sectionId, field, value } = event.data;
        if (sectionId && field && onInlineEdit) {
          onInlineEdit(sectionId, field, value);
        }
      } else if (event.data?.type === "SELECT_SECTION" || event.data?.type === "EDIT_SECTION") {
        const { sectionId } = event.data;
        if (sectionId && onSelectSection) {
          onSelectSection(sectionId);
        }
      } else if (event.data?.type === "EDIT_COMPONENT") {
        const { sectionId, componentId, componentType } = event.data;
        if (sectionId && componentId && onEditComponent) {
          onEditComponent(sectionId, componentId, componentType);
        }
      } else if (event.data?.type === "DELETE_COMPONENT") {
        const { sectionId, componentId } = event.data;
        if (sectionId && componentId && onDeleteComponent) {
          onDeleteComponent(sectionId, componentId);
        }
      } else if (event.data?.type === "PREVIEW_READY" || event.data?.type === "READY") {
        isReadyRef.current = true;
        setIsLoading(false);
        setIframeLoaded(true);
        // Send initial theme snapshot & flush any pending messages
        sendToIframe({
          type: "UPDATE_THEME",
          theme: themeConfig,
          pageType,
        });
        flushQueue();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [themeConfig, pageType, onInlineEdit, onSelectSection, onEditComponent, onDeleteComponent, sendToIframe, flushQueue]);

  // Send theme updates to the iframe whenever themeConfig or pageType changes (Debounced: 100ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      sendToIframe({
        type: "UPDATE_THEME",
        theme: themeConfig,
        pageType,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [themeConfig, pageType, sendToIframe]);

  // Force refresh message when save draft succeeds
  useEffect(() => {
    if (forceRefreshTrigger > 0) {
      sendToIframe({
        type: "FORCE_REFRESH",
        theme: themeConfig,
        pageType,
      });
    }
  }, [forceRefreshTrigger, themeConfig, pageType, sendToIframe]);

  const handleIframeLoad = () => {
    isReadyRef.current = true;
    setIsLoading(false);
    setIframeLoaded(true);
    sendToIframe({
      type: "UPDATE_THEME",
      theme: themeConfig,
      pageType,
    });
    flushQueue();
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeLoaded(false);
    isReadyRef.current = false;
    if (iframeRef.current) {
      iframeRef.current.src = effectiveIframeSrc;
    }
  };

  const handleManualRefresh = () => {
    sendToIframe({
      type: "FORCE_REFRESH",
      theme: themeConfig,
      pageType,
    });
    handleReload();
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
          {pageType && (
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
              {pageType}
            </span>
          )}
          {isLoading && (
            <span className="flex items-center gap-1 text-[#25D366]">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Syncing preview...</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="font-mono uppercase">{device}</span>
          <button
            type="button"
            onClick={handleManualRefresh}
            title="Force refresh preview (🔄)"
            className="hover:text-slate-300 p-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1 text-[10px] text-slate-400"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
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
          key={effectiveIframeSrc}
          src={effectiveIframeSrc}
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
