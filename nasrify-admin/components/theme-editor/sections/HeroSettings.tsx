"use client";

import React from "react";
import ImageUploadField from "../ImageUploadField";

interface HeroSettingsProps {
  settings: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange: (variant: string) => void;
}

export default function HeroSettings({
  settings = {},
  variant = "full_image",
  onChange,
  onVariantChange,
}: HeroSettingsProps) {
  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Heading
        </label>
        <input
          type="text"
          value={settings.heading || ""}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="Elevate Your Lifestyle"
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Subheading
        </label>
        <textarea
          rows={3}
          value={settings.subheading || ""}
          onChange={(e) => onChange({ subheading: e.target.value })}
          placeholder="Hand-crafted modern essentials engineered for everyday elegance..."
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            CTA Text
          </label>
          <input
            type="text"
            value={settings.cta_text || ""}
            onChange={(e) => onChange({ cta_text: e.target.value })}
            placeholder="Shop Now"
            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            CTA Link
          </label>
          <input
            type="text"
            value={settings.cta_link || ""}
            onChange={(e) => onChange({ cta_link: e.target.value })}
            placeholder="/shop"
            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <ImageUploadField
        label="Hero Background Image"
        value={settings.image_url || ""}
        onChange={(url) => onChange({ image_url: url })}
        description="High resolution photo (1600x900 recommended)"
      />

      <div className="grid grid-cols-2 gap-2 pt-2">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            Height
          </label>
          <select
            value={settings.height || "600px"}
            onChange={(e) => onChange({ height: e.target.value })}
            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
          >
            <option value="450px">Short (450px)</option>
            <option value="600px">Medium (600px)</option>
            <option value="750px">Tall (750px)</option>
            <option value="100vh">Fullscreen (100vh)</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300">
            Text Alignment
          </label>
          <select
            value={settings.alignment || "center"}
            onChange={(e) => onChange({ alignment: e.target.value })}
            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      <div>
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          Hero Layout Variant
        </label>
        <select
          value={variant || "full_image"}
          onChange={(e) => onVariantChange(e.target.value)}
          className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
        >
          <option value="full_image">Full Image Overlay</option>
          <option value="split">Split Image & Content</option>
          <option value="text_only">Minimal Text Only</option>
        </select>
      </div>
    </div>
  );
}
