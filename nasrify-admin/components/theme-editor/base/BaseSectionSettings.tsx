"use client";

import React, { useState } from "react";
import { SectionSchema } from "@/lib/themes/section-schema";
import { SchemaFieldRenderer } from "./SchemaFieldRenderer";
import { useSectionSettings } from "./useSectionSettings";
import { getSectionPresets } from "@/lib/themes/section-presets";
import {
  TypographyControl,
  BackgroundControl,
  BorderControl,
  ShadowControl,
  HoverControl,
  AnimationControl,
  CustomCSSControl,
  PositionControl,
  SpacingControl,
} from "../controls";

export interface BaseSectionSettingsProps {
  schema: SectionSchema;
  settings?: Record<string, any>;
  variant?: string;
  activeTab?: "content" | "style" | "advanced";
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function BaseSectionSettings({
  schema,
  settings = {},
  variant,
  activeTab: controlledTab,
  onChange,
  onVariantChange,
}: BaseSectionSettingsProps) {
  const [internalTab, setInternalTab] = useState<"content" | "style" | "advanced">("content");
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    typography: false,
    background: false,
    border: false,
    shadow: false,
    hover: false,
    layout: false,
    animation: false,
    responsive: false,
    customcss: false,
    position: false,
  });

  const activeTab = controlledTab || internalTab;

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const {
    settings: effectiveSettings,
    variant: currentVariant,
    advanced,
    advancedStyle,
    setFieldValue,
    setVariant,
    setAdvanced,
    setAdvancedStyle,
    applyPreset,
  } = useSectionSettings({
    schema,
    settings,
    variant,
    onChange,
    onVariantChange,
  });

  const presets = schema.presets || getSectionPresets(schema.type) || [];

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Presets Bar (Top) */}
      {presets.length > 0 && (
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>✨ Style Presets</span>
            <span className="text-[10px] text-slate-500 font-normal">1-Click Apply</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map((p: any, idx: number) => (
              <button
                key={p.id || p.name || idx}
                type="button"
                onClick={() => applyPreset(p)}
                title={p.description || p.name}
                className="px-2 py-1.5 rounded-md bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-200 text-[11px] font-medium transition-all text-left truncate"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Variant Selector (if defined in schema) */}
      {schema.variants && schema.variants.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Section Variant</label>
          <select
            value={currentVariant}
            onChange={(e) => setVariant(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none [&>option]:bg-slate-900"
          >
            {schema.variants.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 3. Standalone Tab Header (shown when controlledTab is not provided) */}
      {!controlledTab && (
        <div className="grid grid-cols-3 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            type="button"
            onClick={() => setInternalTab("content")}
            className={`py-1 font-medium rounded transition-colors text-center ${
              activeTab === "content"
                ? "bg-slate-800 text-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Content
          </button>
          <button
            type="button"
            onClick={() => setInternalTab("style")}
            className={`py-1 font-medium rounded transition-colors text-center ${
              activeTab === "style"
                ? "bg-slate-800 text-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Style
          </button>
          <button
            type="button"
            onClick={() => setInternalTab("advanced")}
            className={`py-1 font-medium rounded transition-colors text-center ${
              activeTab === "advanced"
                ? "bg-slate-800 text-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Advanced
          </button>
        </div>
      )}

      {/* 4. TAB: CONTENT */}
      {activeTab === "content" && (
        <div className="space-y-3">
          {schema.content.length === 0 ? (
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-800/40 text-slate-400 text-xs">
              No custom content fields defined for this section.
            </div>
          ) : (
            schema.content.map((field) => (
              <SchemaFieldRenderer
                key={field.key}
                field={field}
                value={effectiveSettings[field.key]}
                onChange={(val) => setFieldValue(field.key, val)}
              />
            ))
          )}
        </div>
      )}

      {/* 5. TAB: STYLE */}
      {activeTab === "style" && (
        <div className="space-y-3">
          {/* Typography */}
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
                  onChange={(t) => setAdvancedStyle({ typography: t })}
                />
              </div>
            )}
          </div>

          {/* Background */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("background")}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span>🎨 Background (Color, Gradient, Image)</span>
              <span className="text-slate-400 text-[10px]">
                {openAccordions.background ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.background && (
              <div className="p-3 border-t border-slate-800/80">
                <BackgroundControl
                  value={advancedStyle.background}
                  onChange={(bg) => setAdvancedStyle({ background: bg })}
                />
              </div>
            )}
          </div>

          {/* Border */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("border")}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span>🔲 Border &amp; Radius</span>
              <span className="text-slate-400 text-[10px]">
                {openAccordions.border ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.border && (
              <div className="p-3 border-t border-slate-800/80">
                <BorderControl
                  value={advancedStyle.border}
                  onChange={(b) => setAdvancedStyle({ border: b })}
                />
              </div>
            )}
          </div>

          {/* Shadow */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("shadow")}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span>🌑 Box Shadows</span>
              <span className="text-slate-400 text-[10px]">
                {openAccordions.shadow ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.shadow && (
              <div className="p-3 border-t border-slate-800/80">
                <ShadowControl
                  value={advancedStyle.shadows}
                  onChange={(sh) => setAdvancedStyle({ shadows: sh })}
                />
              </div>
            )}
          </div>

          {/* Hover */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("hover")}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span>✨ Hover Effects &amp; Transitions</span>
              <span className="text-slate-400 text-[10px]">
                {openAccordions.hover ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.hover && (
              <div className="p-3 border-t border-slate-800/80">
                <HoverControl
                  value={advancedStyle.hover}
                  onChange={(h) => setAdvancedStyle({ hover: h })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB: ADVANCED */}
      {activeTab === "advanced" && (
        <div className="space-y-3">
          {/* Spacing / Layout */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("layout")}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span>📐 Spacing &amp; Layout</span>
              <span className="text-slate-400 text-[10px]">
                {openAccordions.layout ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.layout && (
              <div className="p-3 border-t border-slate-800/80">
                <SpacingControl
                  label="Margin & Padding Spacing"
                  value={advancedStyle.spacing}
                  onChange={(sp) => setAdvancedStyle({ spacing: sp })}
                />
              </div>
            )}
          </div>

          {/* Animation */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("animation")}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span>⚡ Entrance &amp; Scroll Motion</span>
              <span className="text-slate-400 text-[10px]">
                {openAccordions.animation ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.animation && (
              <div className="p-3 border-t border-slate-800/80">
                <AnimationControl
                  value={advancedStyle.animation}
                  onChange={(a) => setAdvancedStyle({ animation: a })}
                />
              </div>
            )}
          </div>

          {/* Responsive */}
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
                      setAdvanced({
                        responsive: {
                          ...advanced.responsive,
                          hideOnDesktop: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-slate-300">🖥️ Hide on Desktop (1025px+)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(advanced.responsive?.hideOnTablet)}
                    onChange={(e) =>
                      setAdvanced({
                        responsive: {
                          ...advanced.responsive,
                          hideOnTablet: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-slate-300">📱 Hide on Tablet (768px - 1024px)</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(advanced.responsive?.hideOnMobile)}
                    onChange={(e) =>
                      setAdvanced({
                        responsive: {
                          ...advanced.responsive,
                          hideOnMobile: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                  />
                  <span className="text-slate-300">📱 Hide on Mobile (&lt; 768px)</span>
                </label>
              </div>
            )}
          </div>

          {/* Custom CSS */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("customcss")}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span>💻 Custom CSS</span>
              <span className="text-slate-400 text-[10px]">
                {openAccordions.customcss ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.customcss && (
              <div className="p-3 border-t border-slate-800/80">
                <CustomCSSControl
                  value={advanced.customCSS}
                  onChange={(css) => setAdvanced({ customCSS: css })}
                />
              </div>
            )}
          </div>

          {/* Position */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("position")}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span>📍 Positioning &amp; Z-Index</span>
              <span className="text-slate-400 text-[10px]">
                {openAccordions.position ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.position && (
              <div className="p-3 border-t border-slate-800/80">
                <PositionControl
                  value={advanced.position}
                  onChange={(pos) => setAdvanced({ position: pos })}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
