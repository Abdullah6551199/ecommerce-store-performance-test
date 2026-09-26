"use client";

import React from "react";
import { FieldConfig } from "@/lib/themes/section-schema";
import ImageUploadField from "../ImageUploadField";
import { RichTextField } from "../RichTextField";
import {
  ColorControl,
  SizeControl,
  SpacingControl,
  GradientControl,
  ShadowControl,
  BorderControl,
  TypographyControl,
  HoverControl,
  AnimationControl,
  CustomCSSControl,
  PositionControl,
  BackgroundControl,
  ZIndexControl,
} from "../controls";

interface SchemaFieldRendererProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
}

export function SchemaFieldRenderer({
  field,
  value,
  onChange,
}: SchemaFieldRendererProps) {
  const currentValue = value !== undefined ? value : field.default;

  switch (field.type) {
    case "text":
      return (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">
            {field.label}
          </label>
          <input
            type="text"
            value={currentValue ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
          {field.description && (
            <p className="text-[10px] text-slate-400">{field.description}</p>
          )}
        </div>
      );

    case "url":
      return (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">
            {field.label}
          </label>
          <input
            type="text"
            value={currentValue ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || "/shop"}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
          {field.description && (
            <p className="text-[10px] text-slate-400">{field.description}</p>
          )}
        </div>
      );

    case "richtext":
      return (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">
            {field.label}
          </label>
          <RichTextField
            value={currentValue ?? ""}
            onChange={(val) => onChange(val)}
            placeholder={field.placeholder}
            minHeight="60px"
          />
          {field.description && (
            <p className="text-[10px] text-slate-400">{field.description}</p>
          )}
        </div>
      );

    case "image":
      return (
        <div className="space-y-1">
          <ImageUploadField
            label={field.label}
            value={currentValue ?? ""}
            onChange={(url) => onChange(url)}
          />
          {field.description && (
            <p className="text-[10px] text-slate-400">{field.description}</p>
          )}
        </div>
      );

    case "number":
      return (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              {field.label}
            </label>
            {field.min !== undefined && field.max !== undefined && (
              <span className="text-[10px] text-slate-400 font-mono">
                {currentValue ?? field.min}
              </span>
            )}
          </div>
          <input
            type="number"
            value={currentValue ?? 0}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
          {field.description && (
            <p className="text-[10px] text-slate-400">{field.description}</p>
          )}
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center justify-between py-1">
          <div>
            <label className="text-xs font-medium text-slate-300 cursor-pointer">
              {field.label}
            </label>
            {field.description && (
              <p className="text-[10px] text-slate-400">{field.description}</p>
            )}
          </div>
          <input
            type="checkbox"
            checked={Boolean(currentValue)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 cursor-pointer"
          />
        </div>
      );

    case "select":
      return (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">
            {field.label}
          </label>
          <select
            value={currentValue ?? field.options?.[0]?.value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none [&>option]:bg-slate-900"
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {field.description && (
            <p className="text-[10px] text-slate-400">{field.description}</p>
          )}
        </div>
      );

    case "color":
      return (
        <ColorControl
          label={field.label}
          value={currentValue ?? "#000000"}
          onChange={(color) => onChange(color)}
          description={field.description}
        />
      );

    case "repeater": {
      const items: any[] = Array.isArray(currentValue) ? currentValue : [];
      const itemFields: any[] = field.fields || field.itemFields || [];

      const handleAddItem = () => {
        const newItem: Record<string, any> = {};
        itemFields.forEach((f: any) => {
          newItem[f.key] = f.default ?? "";
        });
        onChange([...items, newItem]);
      };

      const handleRemoveItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
      };

      const handleItemChange = (index: number, subKey: string, subVal: any) => {
        const next = [...items];
        next[index] = { ...next[index], [subKey]: subVal };
        onChange(next);
      };

      return (
        <div className="space-y-2 border border-slate-800 rounded-lg p-2.5 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              {field.label} ({items.length})
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[11px] font-medium transition-colors"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-2 rounded border border-slate-800 bg-slate-900/60 space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    Item #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-slate-500 hover:text-rose-400 text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {itemFields.map((subField: any) => (
                  <SchemaFieldRenderer
                    key={subField.key}
                    field={subField}
                    value={item[subField.key]}
                    onChange={(newVal) =>
                      handleItemChange(idx, subField.key, newVal)
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "size":
      return <SizeControl label={field.label} value={currentValue} onChange={onChange} description={field.description} />;
    case "spacing":
      return <SpacingControl label={field.label} value={currentValue} onChange={onChange} />;
    case "gradient":
      return <GradientControl label={field.label} value={currentValue} onChange={onChange} />;
    case "shadow":
      return <ShadowControl label={field.label} value={currentValue} onChange={onChange} />;
    case "background":
      return <BackgroundControl label={field.label} value={currentValue} onChange={onChange} description={field.description} />;
    case "border":
      return <BorderControl label={field.label} value={currentValue} onChange={onChange} description={field.description} />;
    case "typography":
      return <TypographyControl label={field.label} value={currentValue} onChange={onChange} description={field.description} />;
    case "hover":
      return <HoverControl value={currentValue} onChange={onChange} />;
    case "animation":
      return <AnimationControl label={field.label} value={currentValue} onChange={onChange} description={field.description} />;
    case "customcss":
      return <CustomCSSControl label={field.label} value={currentValue} onChange={onChange} description={field.description} />;
    case "position":
      return <PositionControl value={currentValue} onChange={onChange} />;
    case "zindex":
      return <ZIndexControl label={field.label} value={currentValue} onChange={onChange} />;

    default:
      return null;
  }
}
