"use client";

import React, { useState } from "react";
import { GlobalSettings } from "./GlobalSettings";
import { SectionSettings } from "./SectionSettings";
import {
  TypographyControl,
  BackgroundControl,
  BorderControl,
  ShadowControl,
  HoverControl,
  SpacingControl,
  PositionControl,
  AnimationControl,
  CustomCSSControl,
} from "./controls";

interface SettingsPanelProps {
  selectedSection: {
    id: string;
    type: string;
    variant?: string;
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

type TabType = "content" | "style" | "advanced";

export function SettingsPanel({
  selectedSection,
  globalSettings,
  onUpdateSectionSettings,
  onUpdateGlobalSettings,
  onDeselectSection,
  onDeleteSection,
  onToggleSectionVisibility,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("content");

  // Accordion open states
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    typography: true,
    background: false,
    border: false,
    shadows: false,
    hover: false,
    spacing: true,
    position: false,
    animation: false,
    responsive: false,
    customCss: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const advanced = (selectedSection?.settings?._advanced || {}) as Record<string, any>;
  const advancedStyle = advanced.style || {};

  const handleUpdateAdvanced = (patch: Record<string, any>) => {
    if (!selectedSection) return;
    const newAdvanced = {
      ...advanced,
      ...patch,
    };
    onUpdateSectionSettings(selectedSection.id, {
      _advanced: newAdvanced,
    });
  };

  const handleUpdateAdvancedStyle = (stylePatch: Record<string, any>) => {
    handleUpdateAdvanced({
      style: {
        ...advancedStyle,
        ...stylePatch,
      },
    });
  };

  return (
    <aside className="w-96 shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden select-none">
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

      {/* Tabs Header (When a section is selected) */}
      {selectedSection && (
        <div className="grid grid-cols-3 bg-slate-950 border-b border-slate-800 p-1 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`py-1.5 font-medium rounded transition-colors text-center ${
              activeTab === "content"
                ? "bg-slate-800 text-green-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("style")}
            className={`py-1.5 font-medium rounded transition-colors text-center ${
              activeTab === "style"
                ? "bg-slate-800 text-green-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Style
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("advanced")}
            className={`py-1.5 font-medium rounded transition-colors text-center ${
              activeTab === "advanced"
                ? "bg-slate-800 text-green-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Advanced
          </button>
        </div>
      )}

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {selectedSection ? (
          <div>
            <div className="mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {selectedSection.name || selectedSection.type.replace(/_/g, " ").toUpperCase()}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  type: {selectedSection.type}
                </span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 capitalize">
                {activeTab} Mode
              </span>
            </div>

            {/* TAB 1: CONTENT */}
            {activeTab === "content" && (
              <SectionSettings
                section={selectedSection}
                onChange={(patch) => onUpdateSectionSettings(selectedSection.id, patch)}
              />
            )}

            {/* TAB 2: STYLE */}
            {activeTab === "style" && (
              <div className="space-y-3">
                {/* 1. Typography Accordion */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("typography")}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
                  >
                    <span>🔤 Typography</span>
                    <span className="text-slate-400 text-[10px]">
                      {openAccordions.typography ? "▲" : "▼"}
                    </span>
                  </button>
                  {openAccordions.typography && (
                    <div className="p-3 border-t border-slate-800/80">
                      <TypographyControl
                        value={advancedStyle.typography}
                        onChange={(t) => handleUpdateAdvancedStyle({ typography: t })}
                      />
                    </div>
                  )}
                </div>

                {/* 2. Background Accordion */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("background")}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
                  >
                    <span>🎨 Background (Color, Gradient, Image, Video)</span>
                    <span className="text-slate-400 text-[10px]">
                      {openAccordions.background ? "▲" : "▼"}
                    </span>
                  </button>
                  {openAccordions.background && (
                    <div className="p-3 border-t border-slate-800/80">
                      <BackgroundControl
                        value={advancedStyle.background}
                        onChange={(bg) => handleUpdateAdvancedStyle({ background: bg })}
                      />
                    </div>
                  )}
                </div>

                {/* 3. Border & Radius Accordion */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("border")}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
                  >
                    <span>🔲 Border & Corner Radius</span>
                    <span className="text-slate-400 text-[10px]">
                      {openAccordions.border ? "▲" : "▼"}
                    </span>
                  </button>
                  {openAccordions.border && (
                    <div className="p-3 border-t border-slate-800/80">
                      <BorderControl
                        value={advancedStyle.border}
                        onChange={(b) => handleUpdateAdvancedStyle({ border: b })}
                      />
                    </div>
                  )}
                </div>

                {/* 4. Box Shadows Accordion */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("shadows")}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
                  >
                    <span>🌓 Multi-Layer Shadows</span>
                    <span className="text-slate-400 text-[10px]">
                      {openAccordions.shadows ? "▲" : "▼"}
                    </span>
                  </button>
                  {openAccordions.shadows && (
                    <div className="p-3 border-t border-slate-800/80 space-y-3">
                      <ShadowControl
                        label="Box Shadow Layers"
                        value={advancedStyle.shadows}
                        onChange={(s) =>
                          handleUpdateAdvancedStyle({ shadows: Array.isArray(s) ? s : [] })
                        }
                      />

                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                        <label className="text-xs font-semibold text-slate-200 uppercase tracking-wide block">
                          Shadow Animation
                        </label>
                        <select
                          value={advancedStyle.shadowAnimation || "none"}
                          onChange={(e) =>
                            handleUpdateAdvancedStyle({ shadowAnimation: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2 text-xs text-slate-200 focus:outline-none focus:border-green-500 [&>option]:bg-slate-900 [&>option]:text-slate-100"
                        >
                          <option value="none">None</option>
                          <option value="pulse">Pulse Shadow (Infinite)</option>
                          <option value="glow">Glow Shadow (Alternate)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Hover Effects Accordion */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("hover")}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
                  >
                    <span>⚡ Hover Effects</span>
                    <span className="text-slate-400 text-[10px]">
                      {openAccordions.hover ? "▲" : "▼"}
                    </span>
                  </button>
                  {openAccordions.hover && (
                    <div className="p-3 border-t border-slate-800/80">
                      <HoverControl
                        value={advancedStyle.hover}
                        onChange={(h) => handleUpdateAdvancedStyle({ hover: h })}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ADVANCED */}
            {activeTab === "advanced" && (
              <div className="space-y-3">
                {/* 1. Spacing & Layout Accordion */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("spacing")}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
                  >
                    <span>📐 Spacing & Layout</span>
                    <span className="text-slate-400 text-[10px]">
                      {openAccordions.spacing ? "▲" : "▼"}
                    </span>
                  </button>
                  {openAccordions.spacing && (
                    <div className="p-3 border-t border-slate-800/80 space-y-3">
                      <SpacingControl
                        label="Padding"
                        value={advancedStyle.padding}
                        onChange={(pad) => handleUpdateAdvancedStyle({ padding: pad })}
                      />
                      <SpacingControl
                        label="Margin"
                        value={advancedStyle.margin}
                        onChange={(mar) => handleUpdateAdvancedStyle({ margin: mar })}
                      />
                    </div>
                  )}
                </div>

                {/* 2. Position & Z-Index Accordion */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("position")}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
                  >
                    <span>📍 Position & Z-Index</span>
                    <span className="text-slate-400 text-[10px]">
                      {openAccordions.position ? "▲" : "▼"}
                    </span>
                  </button>
                  {openAccordions.position && (
                    <div className="p-3 border-t border-slate-800/80">
                      <PositionControl
                        value={advancedStyle.position}
                        onChange={(pos) => handleUpdateAdvancedStyle({ position: pos })}
                      />
                    </div>
                  )}
                </div>

                {/* 3. Motion & Animation Accordion */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("animation")}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
                  >
                    <span>🎬 Motion & Animations</span>
                    <span className="text-slate-400 text-[10px]">
                      {openAccordions.animation ? "▲" : "▼"}
                    </span>
                  </button>
                  {openAccordions.animation && (
                    <div className="p-3 border-t border-slate-800/80">
                      <AnimationControl
                        value={advanced.animation}
                        onChange={(anim) => handleUpdateAdvanced({ animation: anim })}
                      />
                    </div>
                  )}
                </div>

                {/* 4. Responsive Device Visibility Accordion */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("responsive")}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
                  >
                    <span>📱 Responsive Visibility</span>
                    <span className="text-slate-400 text-[10px]">
                      {openAccordions.responsive ? "▲" : "▼"}
                    </span>
                  </button>
                  {openAccordions.responsive && (
                    <div className="p-3 border-t border-slate-800/80 space-y-2 text-xs">
                      <p className="text-[11px] text-slate-400 mb-2">
                        Control whether this section appears on specific device screens:
                      </p>
                      <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(advanced.responsive?.hideOnDesktop)}
                          onChange={(e) =>
                            handleUpdateAdvanced({
                              responsive: {
                                ...advanced.responsive,
                                hideOnDesktop: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-slate-700 bg-slate-900 text-green-500"
                        />
                        <span className="text-slate-300">🖥️ Hide on Desktop (1025px+)</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(advanced.responsive?.hideOnTablet)}
                          onChange={(e) =>
                            handleUpdateAdvanced({
                              responsive: {
                                ...advanced.responsive,
                                hideOnTablet: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-slate-700 bg-slate-900 text-green-500"
                        />
                        <span className="text-slate-300">📱 Hide on Tablet (768px - 1024px)</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(advanced.responsive?.hideOnMobile)}
                          onChange={(e) =>
                            handleUpdateAdvanced({
                              responsive: {
                                ...advanced.responsive,
                                hideOnMobile: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-slate-700 bg-slate-900 text-green-500"
                        />
                        <span className="text-slate-300">📱 Hide on Mobile (≤767px)</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* 5. Custom CSS Accordion */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("customCss")}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
                  >
                    <span>💻 Custom CSS</span>
                    <span className="text-slate-400 text-[10px]">
                      {openAccordions.customCss ? "▲" : "▼"}
                    </span>
                  </button>
                  {openAccordions.customCss && (
                    <div className="p-3 border-t border-slate-800/80">
                      <CustomCSSControl
                        value={advanced.customCss}
                        onChange={(css) => handleUpdateAdvanced({ customCss: css })}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
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
