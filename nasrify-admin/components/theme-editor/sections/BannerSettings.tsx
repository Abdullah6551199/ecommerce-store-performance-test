"use client";

import React, { useState } from "react";
import { ImageUploadField } from "../ImageUploadField";
import { RichTextField } from "../RichTextField";
import { getSectionPresets } from "@/lib/themes/section-presets";

interface BannerSettingsProps {
  settings: Record<string, any>;
  onChange: (patch: Record<string, any>) => void;
}

export function BannerSettings({ settings, onChange }: BannerSettingsProps) {
  const [activeTab, setActiveTab] = useState<"settings" | "presets">("settings");
  const presets = getSectionPresets("banner");

  const heading = settings.heading ?? "Special Offer";
  const heading_size = settings.heading_size ?? "xl";
  const text = settings.text ?? "Discover our latest seasonal collections and exclusive promotions.";
  const cta_text = settings.cta_text ?? "Shop Now";
  const cta_link = settings.cta_link ?? "/products";
  const button_size = settings.button_size ?? "md";
  const image_url = settings.image_url ?? "";
  const crop_data = settings.crop_data;
  const height = settings.height ?? "medium";
  const variant = settings.variant ?? "full_width";

  return (
    <div className="space-y-4 text-xs text-slate-300">
      {/* Preset / Custom Toggle */}
      {presets.length > 0 && (
        <div className="flex rounded bg-slate-800/80 p-0.5 border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-1 px-2 rounded text-center text-[11px] font-medium transition-colors ${
              activeTab === "settings"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Custom Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`flex-1 py-1 px-2 rounded text-center text-[11px] font-medium transition-colors ${
              activeTab === "presets"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Style Presets ({presets.length})
          </button>
        </div>
      )}

      {activeTab === "presets" ? (
        <div className="space-y-2">
          <div className="text-[11px] text-slate-400 mb-2">
            Click a preset to apply pre-configured typography, layout, and visual styles:
          </div>
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onChange({
                  ...preset.settings,
                  ...(preset.variant ? { variant: preset.variant } : {}),
                });
              }}
              className="w-full text-left p-2.5 rounded-lg border border-slate-700 hover:border-[#25D366] bg-slate-800/50 hover:bg-slate-800 transition-all flex flex-col gap-1 group"
            >
              <div className="font-semibold text-slate-200 group-hover:text-[#25D366] flex items-center justify-between">
                <span>{preset.name}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                  {preset.variant || "preset"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Heading with Size Control */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-medium">Heading</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Size</span>
                <select
                  value={heading_size}
                  onChange={(e) => onChange({ heading_size: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 text-[11px] focus:outline-none focus:border-[#25D366] [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="sm">SM</option>
                  <option value="md">MD</option>
                  <option value="lg">LG</option>
                  <option value="xl">XL</option>
                  <option value="2xl">2XL</option>
                  <option value="3xl">3XL</option>
                </select>
              </div>
            </div>
            <input
              type="text"
              value={heading}
              onChange={(e) => onChange({ heading: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366] [&>option]:bg-slate-900 [&>option]:text-slate-100"
            />
          </div>

          {/* Subtext with Rich Text */}
          <RichTextField
            label="Banner Subtext / Description"
            value={text}
            onChange={(val) => onChange({ text: val })}
            placeholder="Banner promo description..."
          />

          {/* CTA Button and Button Size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-medium">CTA Text</label>
                <select
                  value={button_size}
                  onChange={(e) => onChange({ button_size: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-slate-300 text-[10px] focus:outline-none focus:border-[#25D366] [&>option]:bg-slate-900 [&>option]:text-slate-100"
                >
                  <option value="sm">SM</option>
                  <option value="md">MD</option>
                  <option value="lg">LG</option>
                  <option value="xl">XL</option>
                </select>
              </div>
              <input
                type="text"
                value={cta_text}
                onChange={(e) => onChange({ cta_text: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366] [&>option]:bg-slate-900 [&>option]:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">CTA Link</label>
              <input
                type="text"
                value={cta_link}
                onChange={(e) => onChange({ cta_link: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366] [&>option]:bg-slate-900 [&>option]:text-slate-100"
              />
            </div>
          </div>

          {/* Banner Image with Crop Support */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Banner Image</label>
            <ImageUploadField
              value={image_url}
              cropData={crop_data}
              onChange={(url) => onChange({ image_url: url })}
              onCropChange={(crop) => onChange({ crop_data: crop })}
              label="Select banner background image"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Height</label>
              <select
                value={height}
                onChange={(e) => onChange({ height: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366] [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="tall">Tall</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Variant</label>
              <select
                value={variant}
                onChange={(e) => onChange({ variant: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366] [&>option]:bg-slate-900 [&>option]:text-slate-100"
              >
                <option value="full_width">Full Width</option>
                <option value="boxed">Boxed</option>
                <option value="side_by_side">Side by Side</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
