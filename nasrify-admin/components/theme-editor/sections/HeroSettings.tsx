"use client";

import React from "react";
import ImageUploadField from "../ImageUploadField";
import { RichTextField } from "../RichTextField";
import { getSectionPresets } from "@/lib/themes/section-presets";

interface HeroSettingsProps {
  settings: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange: (variant: string) => void;
}

const TEXT_SIZES = [
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
  { value: "xl", label: "XL" },
  { value: "2xl", label: "2XL" },
  { value: "3xl", label: "3XL" },
];

export default function HeroSettings({
  settings = {},
  variant = "full_image",
  onChange,
  onVariantChange,
}: HeroSettingsProps) {
  const presets = getSectionPresets("hero");

  const handleApplyPreset = (preset: any) => {
    if (preset.variant) {
      onVariantChange(preset.variant);
    }
    onChange({
      ...settings,
      ...preset.settings,
    });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Style Presets */}
      {presets.length > 0 && (
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>✨ Style Presets</span>
            <span className="text-[10px] text-slate-500 font-normal">1-Click Apply</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                title={p.description}
                className="px-2 py-1.5 rounded-md bg-slate-950 border border-slate-800 hover:border-[#25D366]/50 hover:bg-[#25D366]/10 text-slate-200 text-[11px] font-medium transition-all text-left truncate"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Heading with Rich Text (Multi-Color & Word Animations) & Size control */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-semibold text-slate-300">Heading (Rich Text / Multi-Color)</label>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500">Size:</span>
            <select
              value={settings.heading_size || "xl"}
              onChange={(e) => onChange({ heading_size: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-200 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
            >
              {TEXT_SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <RichTextField
          value={settings.heading || ""}
          onChange={(val) => onChange({ heading: val })}
          placeholder="Elevate Your Lifestyle"
          minHeight="60px"
        />
      </div>

      {/* 3. Subheading with Rich Text & Size control */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-semibold text-slate-300">Subheading (Rich Text)</label>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500">Size:</span>
            <select
              value={settings.subheading_size || "md"}
              onChange={(e) => onChange({ subheading_size: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-200 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
            >
              {TEXT_SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <RichTextField
          value={settings.subheading || ""}
          onChange={(val) => onChange({ subheading: val })}
          placeholder="Hand-crafted modern essentials engineered for everyday elegance..."
        />
      </div>

      {/* 4. CTA Text with Size control */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-300">CTA Text</label>
            <select
              value={settings.button_size || "md"}
              onChange={(e) => onChange({ button_size: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-200 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-slate-100"
            >
              {TEXT_SIZES.slice(0, 4).map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={settings.cta_text || ""}
            onChange={(e) => onChange({ cta_text: e.target.value })}
            placeholder="Shop Now"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:border-[#25D366] focus:outline-hidden"
          />
        </div>
        <div>
          <label className="font-semibold text-slate-300 block mb-1">CTA Link</label>
          <input
            type="text"
            value={settings.cta_link || ""}
            onChange={(e) => onChange({ cta_link: e.target.value })}
            placeholder="/shop"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-100 focus:border-[#25D366] focus:outline-hidden"
          />
        </div>
      </div>

      {/* 5. Image Upload & Crop Modal */}
      <ImageUploadField
        label="Hero Background Image"
        value={settings.image_url || ""}
        onChange={(url) => onChange({ image_url: url })}
        cropData={settings.crop_data}
        onCropChange={(crop) => onChange({ crop_data: crop })}
        description="High resolution photo (1600x900 recommended)"
      />

      {/* 6. Height & Alignment */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div>
          <label className="font-semibold text-slate-300 block mb-1">Height</label>
          <select
            value={settings.height || "600px"}
            onChange={(e) => onChange({ height: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 [&>option]:bg-slate-900 [&>option]:text-slate-100"
          >
            <option value="450px">Short (450px)</option>
            <option value="600px">Medium (600px)</option>
            <option value="750px">Tall (750px)</option>
            <option value="850px">Extra Tall (850px)</option>
            <option value="100vh">Fullscreen (100vh)</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-slate-300 block mb-1">Text Alignment</label>
          <select
            value={settings.alignment || "center"}
            onChange={(e) => onChange({ alignment: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 [&>option]:bg-slate-900 [&>option]:text-slate-100"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      {/* 7. Overlay Opacity */}
      <div>
        <div className="flex items-center justify-between text-slate-300 mb-1">
          <label className="font-semibold">Overlay Opacity</label>
          <span className="font-mono text-[11px] text-slate-400">
            {Math.round((settings.overlay_opacity ?? 0.45) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.overlay_opacity ?? 0.45}
          onChange={(e) => onChange({ overlay_opacity: parseFloat(e.target.value) })}
          className="w-full accent-[#25D366]"
        />
      </div>

      {/* 8. Layout Variant */}
      <div>
        <label className="font-semibold text-slate-300 block mb-1">Hero Layout Variant</label>
        <select
          value={variant || "full_image"}
          onChange={(e) => onVariantChange(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 [&>option]:bg-slate-900 [&>option]:text-slate-100"
        >
          <option value="full_image">Full Image / Background</option>
          <option value="split">Split Layout (Text Left / Image Right)</option>
          <option value="text_only">Minimal Text Only</option>
        </select>
      </div>
    </div>
  );
}
