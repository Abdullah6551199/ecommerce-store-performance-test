"use client";

import React, { useState } from "react";
import { ComponentSchema } from "@/lib/themes/component-schema";
import { SchemaFieldRenderer } from "./SchemaFieldRenderer";
import { useComponentSettings } from "./useComponentSettings";
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

export interface BaseComponentProps {
  componentId: string;
  schema: ComponentSchema;
  sectionSettings: Record<string, any>;
  onSectionChange: (updatedSettings: Record<string, any>) => void;
  activeTab?: "content" | "style" | "advanced";
  onBack?: () => void;
}

export function BaseComponent({
  componentId,
  schema,
  sectionSettings,
  onSectionChange,
  activeTab: controlledTab,
  onBack,
}: BaseComponentProps) {
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
    contentSettings,
    variant: currentVariant,
    style,
    advanced,
    setFieldValue,
    setVariant,
    setStyle,
    setAdvanced,
    applyPreset,
  } = useComponentSettings({
    schema,
    componentId,
    sectionSettings,
    onSectionChange,
  });

  const presets = schema.presets || [];

  return (
    <div className="space-y-4 text-xs">
      {/* Header bar with Back button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
              title="Back to Section Settings"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Component Editor
            </div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>{schema.icon || "🧩"}</span>
              <span>{schema.label}</span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">
                ({componentId})
              </span>
            </h3>
          </div>
        </div>
      </div>

      {/* 1. Presets Bar (Top) */}
      {presets.length > 0 && (
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>✨ Component Presets</span>
            <span className="text-[10px] text-slate-500 font-normal">1-Click Apply</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={p.name || idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2 py-1.5 rounded-md bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-200 text-[11px] font-medium transition-all text-left truncate"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Variant Selector (if defined) */}
      {schema.variants && schema.variants.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Component Variant</label>
          <select
            value={currentVariant}
            onChange={(e) => setVariant(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden [&>option]:bg-slate-900"
          >
            {schema.variants.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 3. Standalone Tab Header */}
      {!controlledTab && (
        <div className="grid grid-cols-3 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            type="button"
            onClick={() => setInternalTab("content")}
            className={`py-1 font-medium rounded transition-colors text-center ${
              activeTab === "content"
                ? "bg-slate-800 text-emerald-400 shadow-xs"
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
                ? "bg-slate-800 text-emerald-400 shadow-xs"
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
                ? "bg-slate-800 text-emerald-400 shadow-xs"
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
              No custom content fields defined for this component.
            </div>
          ) : (
            schema.content.map((field) => (
              <SchemaFieldRenderer
                key={field.key}
                field={field}
                value={contentSettings[field.key]}
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
                  value={style.typography}
                  onChange={(t) => setStyle({ typography: t })}
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
              <span>🎨 Background</span>
              <span className="text-slate-400 text-[10px]">
                {openAccordions.background ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.background && (
              <div className="p-3 border-t border-slate-800/80">
                <BackgroundControl
                  value={style.background}
                  onChange={(bg) => setStyle({ background: bg })}
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
                  value={style.border}
                  onChange={(b) => setStyle({ border: b })}
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
                  value={style.shadow}
                  onChange={(s) => setStyle({ shadow: s })}
                />
              </div>
            )}
          </div>

          {/* Hover Effects */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("hover")}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span>✨ Hover Transformations</span>
              <span className="text-slate-400 text-[10px]">
                {openAccordions.hover ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.hover && (
              <div className="p-3 border-t border-slate-800/80">
                <HoverControl
                  value={style.hover}
                  onChange={(h) => setStyle({ hover: h })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB: ADVANCED */}
      {activeTab === "advanced" && (
        <div className="space-y-3">
          {/* Spacing / Padding / Margin */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("layout")}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span>📐 Spacing &amp; Margins</span>
              <span className="text-slate-400 text-[10px]">
                {openAccordions.layout ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.layout && (
              <div className="p-3 border-t border-slate-800/80 space-y-3">
                <SpacingControl
                  label="Padding (px)"
                  value={advanced.layout?.padding || {}}
                  onChange={(pad) =>
                    setAdvanced({
                      layout: { ...(advanced.layout || {}), padding: pad },
                    })
                  }
                />
                <SpacingControl
                  label="Margin (px)"
                  value={advanced.layout?.margin || {}}
                  onChange={(mar) =>
                    setAdvanced({
                      layout: { ...(advanced.layout || {}), margin: mar },
                    })
                  }
                />
              </div>
            )}
          </div>

          {/* Positioning & Z-Index */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("position")}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span>📌 Position &amp; Z-Index</span>
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

          {/* Motion / Animation */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion("animation")}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <span>⚡ Motion &amp; Entrance Animations</span>
              <span className="text-slate-400 text-[10px]">
                {openAccordions.animation ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.animation && (
              <div className="p-3 border-t border-slate-800/80">
                <AnimationControl
                  value={advanced.motion}
                  onChange={(m) => setAdvanced({ motion: m })}
                />
              </div>
            )}
          </div>

          {/* Responsive Device Visibility */}
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
              <div className="p-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Hide on Desktop (&gt;1024px)</span>
                  <input
                    type="checkbox"
                    checked={advanced.responsive?.hideDesktop || false}
                    onChange={(e) =>
                      setAdvanced({
                        responsive: {
                          ...(advanced.responsive || {}),
                          hideDesktop: e.target.checked,
                        },
                      })
                    }
                    className="accent-emerald-500 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Hide on Tablet (768-1024px)</span>
                  <input
                    type="checkbox"
                    checked={advanced.responsive?.hideTablet || false}
                    onChange={(e) =>
                      setAdvanced({
                        responsive: {
                          ...(advanced.responsive || {}),
                          hideTablet: e.target.checked,
                        },
                      })
                    }
                    className="accent-emerald-500 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Hide on Mobile (&lt;768px)</span>
                  <input
                    type="checkbox"
                    checked={advanced.responsive?.hideMobile || false}
                    onChange={(e) =>
                      setAdvanced({
                        responsive: {
                          ...(advanced.responsive || {}),
                          hideMobile: e.target.checked,
                        },
                      })
                    }
                    className="accent-emerald-500 rounded"
                  />
                </div>
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
              <span>💻 Custom CSS Rules</span>
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
        </div>
      )}
    </div>
  );
}
