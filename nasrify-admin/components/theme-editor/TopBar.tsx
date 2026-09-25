"use client";

import React, { useState } from "react";
import Link from "next/link";

export type DeviceMode = "desktop" | "tablet" | "mobile";

interface TopBarProps {
  storeName?: string;
  device: DeviceMode;
  onDeviceChange: (device: DeviceMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSaveDraft: () => Promise<void>;
  isSaving: boolean;
  isDirty: boolean;
  onOpenPublishModal: () => void;
  onDiscardDraft: () => Promise<void>;
  isDiscarding: boolean;
  liveUrl?: string;
}

export function TopBar({
  storeName = "Nasrify Store",
  device,
  onDeviceChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSaveDraft,
  isSaving,
  isDirty,
  onOpenPublishModal,
  onDiscardDraft,
  isDiscarding,
  liveUrl = "https://nasrify-store.zia291930.workers.dev",
}: TopBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left section: Back button & Store Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-xs font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Admin</span>
        </Link>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-xs font-semibold text-slate-200 truncate max-w-40 sm:max-w-xs">
            {storeName}
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700/60 ml-1">
            Visual Theme Editor
          </span>
        </div>
      </div>

      {/* Center: Device Switcher & History Undo/Redo */}
      <div className="flex items-center gap-3">
        {/* Device toggle */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => onDeviceChange("desktop")}
            title="Desktop view (100%)"
            className={`p-1.5 rounded-md text-xs transition-colors ${
              device === "desktop"
                ? "bg-slate-800 text-[#25D366] shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onDeviceChange("tablet")}
            title="Tablet view (768px)"
            className={`p-1.5 rounded-md text-xs transition-colors ${
              device === "tablet"
                ? "bg-slate-800 text-[#25D366] shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onDeviceChange("mobile")}
            title="Mobile view (375px)"
            className={`p-1.5 rounded-md text-xs transition-colors ${
              device === "mobile"
                ? "bg-slate-800 text-[#25D366] shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2m15-7l-6-6m6 6l-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right: Status indicator, Save Draft, Preview, Publish */}
      <div className="flex items-center gap-2.5">
        {/* Status indicator */}
        <div className="hidden sm:flex items-center text-[11px] text-slate-400 mr-1">
          {isSaving ? (
            <span className="flex items-center gap-1.5 text-[#25D366]">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Saving draft...</span>
            </span>
          ) : isDirty ? (
            <span className="text-amber-400">Unsaved changes</span>
          ) : (
            <span className="text-slate-400 flex items-center gap-1">
              <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Draft saved</span>
            </span>
          )}
        </div>

        {/* Save Draft button */}
        <button
          type="button"
          onClick={() => onSaveDraft()}
          disabled={isSaving}
          title="Save Draft (Ctrl+S)"
          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors disabled:opacity-50"
        >
          Save Draft
        </button>

        {/* Open in new tab preview */}
        <a
          href={`${liveUrl}?preview=1`}
          target="_blank"
          rel="noopener noreferrer"
          title="Open preview in new tab"
          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {/* Publish Dropdown Group */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={onOpenPublishModal}
            className="px-3 py-1.5 rounded-l-lg bg-[#25D366] hover:bg-[#25D366] text-white text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Publish</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-1.5 py-1.5 rounded-r-lg bg-[#1EA855] hover:bg-[#25D366] text-white text-xs font-medium border-l border-[#25D366]/40 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <div
              className="absolute right-0 top-full mt-1.5 w-44 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50 text-xs"
              onClick={() => setShowDropdown(false)}
            >
              <button
                type="button"
                onClick={onOpenPublishModal}
                className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <span className="text-emerald-400">●</span>
                <span>Publish to Live</span>
              </button>

              <button
                type="button"
                onClick={onDiscardDraft}
                disabled={isDiscarding}
                className="w-full px-3 py-2 text-left text-rose-400 hover:bg-slate-800 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <span>✕</span>
                <span>Discard Draft</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
