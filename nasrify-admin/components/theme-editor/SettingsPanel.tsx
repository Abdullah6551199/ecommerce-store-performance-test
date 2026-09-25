"use client";

import React from "react";
import { GlobalSettings } from "./GlobalSettings";
import { SectionSettings } from "./SectionSettings";

interface SettingsPanelProps {
  selectedSection: {
    id: string;
    type: string;
    name?: string;
    enabled?: boolean;
    settings?: Record<string, any>;
  } | null;
  globalSettings: any;
  onUpdateSectionSettings: (id: string, patch: Record<string, any>) => void;
  onUpdateGlobalSettings: (patch: Record<string, any>) => void;
  onDeselectSection: () => void;
  onDeleteSection?: (id: string) => void;
  onToggleSectionVisibility?: (id: string) => void;
}

export function SettingsPanel({
  selectedSection,
  globalSettings,
  onUpdateSectionSettings,
  onUpdateGlobalSettings,
  onDeselectSection,
  onDeleteSection,
  onToggleSectionVisibility,
}: SettingsPanelProps) {
  return (
    <aside className="w-84 shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden select-none">
      {/* Panel Header */}
      <div className="h-12 px-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur-sm">
        {selectedSection ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <button
              type="button"
              onClick={onDeselectSection}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Sections</span>
            </button>

            <div className="flex items-center gap-1.5">
              {onToggleSectionVisibility && (
                <button
                  type="button"
                  onClick={() => onToggleSectionVisibility(selectedSection.id)}
                  title={selectedSection.enabled !== false ? "Hide section" : "Show section"}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  {selectedSection.enabled !== false ? (
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  )}
                </button>
              )}

              {onDeleteSection && (
                <button
                  type="button"
                  onClick={() => onDeleteSection(selectedSection.id)}
                  title="Remove section"
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#25D366]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h2 className="text-xs font-semibold text-slate-200">Global Theme Settings</h2>
          </div>
        )}
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {selectedSection ? (
          <div>
            <div className="mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {selectedSection.name || selectedSection.type.replace(/_/g, " ").toUpperCase()}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  type: {selectedSection.type}
                </span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20">
                Visual Settings
              </span>
            </div>

            <SectionSettings
              section={selectedSection}
              onChange={(patch) => onUpdateSectionSettings(selectedSection.id, patch)}
            />
          </div>
        ) : (
          <GlobalSettings
            settings={globalSettings}
            onChange={onUpdateGlobalSettings}
          />
        )}
      </div>
    </aside>
  );
}
