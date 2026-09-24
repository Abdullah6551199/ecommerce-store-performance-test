"use client";

import React from "react";
import { ImageUploadField } from "../ImageUploadField";

interface BannerSettingsProps {
  settings: Record<string, any>;
  onChange: (patch: Record<string, any>) => void;
}

export function BannerSettings({ settings, onChange }: BannerSettingsProps) {
  const heading = settings.heading ?? "Special Offer";
  const text = settings.text ?? "Discover our latest seasonal collections and exclusive promotions.";
  const cta_text = settings.cta_text ?? "Shop Now";
  const cta_link = settings.cta_link ?? "/products";
  const image_url = settings.image_url ?? "";
  const height = settings.height ?? "medium";
  const variant = settings.variant ?? "full_width";

  return (
    <div className="space-y-4 text-xs text-slate-300">
      <div>
        <label className="block text-slate-400 font-medium mb-1">Heading</label>
        <input
          type="text"
          value={heading}
          onChange={(e) => onChange({ heading: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366]"
        />
      </div>

      <div>
        <label className="block text-slate-400 font-medium mb-1">Subtext / Description</label>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => onChange({ text: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366]"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-slate-400 font-medium mb-1">CTA Text</label>
          <input
            type="text"
            value={cta_text}
            onChange={(e) => onChange({ cta_text: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366]"
          />
        </div>
        <div>
          <label className="block text-slate-400 font-medium mb-1">CTA Link</label>
          <input
            type="text"
            value={cta_link}
            onChange={(e) => onChange({ cta_link: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366]"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-400 font-medium mb-1">Banner Image</label>
        <ImageUploadField
          value={image_url}
          onChange={(url) => onChange({ image_url: url })}
          label="Select banner background image"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Height</label>
          <select
            value={height}
            onChange={(e) => onChange({ height: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366]"
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
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366]"
          >
            <option value="full_width">Full Width</option>
            <option value="boxed">Boxed</option>
            <option value="side_by_side">Side by Side</option>
          </select>
        </div>
      </div>
    </div>
  );
}
