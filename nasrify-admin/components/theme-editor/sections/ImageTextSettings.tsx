"use client";

import React from "react";
import { ImageUploadField } from "../ImageUploadField";

interface ImageTextSettingsProps {
  settings: Record<string, any>;
  onChange: (patch: Record<string, any>) => void;
}

export function ImageTextSettings({ settings, onChange }: ImageTextSettingsProps) {
  const heading = settings.heading ?? "Crafted with passion";
  const text = settings.text ?? "We design and engineer every product to deliver exceptional performance and durability.";
  const image_url = settings.image_url ?? "";
  const image_position = settings.image_position ?? "left";
  const cta_text = settings.cta_text ?? "Learn More";
  const cta_link = settings.cta_link ?? "/about";

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
        <label className="block text-slate-400 font-medium mb-1">Text Content</label>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => onChange({ text: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366]"
        />
      </div>

      <div>
        <label className="block text-slate-400 font-medium mb-1">Image</label>
        <ImageUploadField
          value={image_url}
          onChange={(url) => onChange({ image_url: url })}
          label="Select feature image"
        />
      </div>

      <div>
        <label className="block text-slate-400 font-medium mb-1">Image Position</label>
        <select
          value={image_position}
          onChange={(e) => onChange({ image_position: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366]"
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
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
    </div>
  );
}
