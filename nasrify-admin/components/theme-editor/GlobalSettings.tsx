"use client";

import React from "react";
import ImageUploadField from "./ImageUploadField";

interface GlobalSettingsProps {
  settings: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      text_muted: string;
      border: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    layout: {
      container_width: string;
      section_spacing: string;
      border_radius: string;
    };
    logo_url?: string;
    logo_text?: string;
  };
  onChange: (patch: Record<string, any>) => void;
}

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Playfair Display",
  "Outfit",
  "Montserrat",
  "Merriweather",
  "Plus Jakarta Sans",
  "Geist",
];

const CONTAINER_WIDTHS = ["1200px", "1280px", "1440px", "1600px"];
const SECTION_SPACINGS = ["32px", "48px", "64px", "80px", "96px"];
const BORDER_RADII = ["0px", "4px", "8px", "12px", "16px", "24px"];

export function GlobalSettings({ settings, onChange }: GlobalSettingsProps) {
  const colors = settings.colors || {};
  const fonts = settings.fonts || {};
  const layout = settings.layout || {};

  const handleColorChange = (key: string, val: string) => {
    onChange({
      colors: {
        ...colors,
        [key]: val,
      },
    });
  };

  const handleFontChange = (key: string, val: string) => {
    onChange({
      fonts: {
        ...fonts,
        [key]: val,
      },
    });
  };

  const handleLayoutChange = (key: string, val: string) => {
    onChange({
      layout: {
        ...layout,
        [key]: val,
      },
    });
  };

  const COLOR_FIELDS: Array<{ key: string; label: string; def: string }> = [
    { key: "primary", label: "Primary Brand", def: "#18181B" },
    { key: "secondary", label: "Secondary", def: "#52525B" },
    { key: "accent", label: "Accent / Buttons", def: "#2563EB" },
    { key: "background", label: "Page Background", def: "#FFFFFF" },
    { key: "surface", label: "Cards / Surface", def: "#F4F4F5" },
    { key: "text", label: "Heading & Body Text", def: "#18181B" },
    { key: "text_muted", label: "Muted Text", def: "#71717A" },
    { key: "border", label: "Dividers & Borders", def: "#E4E4E7" },
  ];

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Theme Styles & Branding
        </h3>
        <p className="text-gray-500 mt-0.5">
          Global colors, typography, and spacing tokens
        </p>
      </div>

      {/* Brand Logo & Name */}
      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
          Store Logo & Name
        </h4>

        <ImageUploadField
          label="Store Logo"
          value={settings.logo_url || ""}
          onChange={(url) => onChange({ logo_url: url })}
          description="Square or horizontal image shown in header"
        />

        <div className="space-y-1">
          <label className="font-medium text-gray-700 dark:text-gray-300">
            Brand Logo Text Fallback
          </label>
          <input
            type="text"
            value={settings.logo_text || ""}
            onChange={(e) => onChange({ logo_text: e.target.value })}
            placeholder="Nasrify Store"
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
          Color Palette
        </h4>

        <div className="grid grid-cols-1 gap-2.5">
          {COLOR_FIELDS.map((item) => {
            const currentVal = (colors as any)[item.key] || item.def;
            return (
              <div key={item.key} className="flex items-center justify-between gap-3">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentVal.startsWith("#") ? currentVal : item.def}
                    onChange={(e) => handleColorChange(item.key, e.target.value)}
                    className="h-6 w-8 rounded cursor-pointer border border-gray-200 dark:border-zinc-700 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={currentVal}
                    onChange={(e) => handleColorChange(item.key, e.target.value)}
                    className="w-20 px-2 py-1 text-[11px] font-mono rounded border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-center"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
          Typography
        </h4>

        <div className="space-y-2">
          <div>
            <label className="text-gray-600 dark:text-gray-400 font-medium">
              Heading Font
            </label>
            <select
              value={fonts.heading || "Inter"}
              onChange={(e) => handleFontChange("heading", e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-600 dark:text-gray-400 font-medium">
              Body Font
            </label>
            <select
              value={fonts.body || "Inter"}
              onChange={(e) => handleFontChange("body", e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Layout & Spacing */}
      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
          Layout & Spacing
        </h4>

        <div className="space-y-2">
          <div>
            <label className="text-gray-600 dark:text-gray-400 font-medium">
              Container Max Width
            </label>
            <select
              value={layout.container_width || "1280px"}
              onChange={(e) => handleLayoutChange("container_width", e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
            >
              {CONTAINER_WIDTHS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-600 dark:text-gray-400 font-medium">
              Section Spacing
            </label>
            <select
              value={layout.section_spacing || "64px"}
              onChange={(e) => handleLayoutChange("section_spacing", e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
            >
              {SECTION_SPACINGS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-600 dark:text-gray-400 font-medium">
              Default Border Radius
            </label>
            <select
              value={layout.border_radius || "8px"}
              onChange={(e) => handleLayoutChange("border_radius", e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white"
            >
              {BORDER_RADII.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
