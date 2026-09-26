"use client";

import React from "react";
import { BaseSectionSettings } from "./base";
import { getSectionSchema, SECTION_SCHEMAS } from "@/lib/themes/section-schema";

interface SectionSettingsProps {
  section: {
    id: string;
    type: string;
    variant?: string;
    name?: string;
    settings?: Record<string, any>;
  };
  onChange: (patch: Record<string, any>) => void;
}

export function SectionSettings({ section, onChange }: SectionSettingsProps) {
  const normalizedType = section.type === "announcement_bar" ? "announcement" : section.type;
  const schema = getSectionSchema(normalizedType);

  const handleVariantChange = (variant: string) => {
    onChange({ variant });
  };

  // If schema exists in the registry, render BaseSectionSettings
  if (schema) {
    return (
      <BaseSectionSettings
        schema={schema}
        settings={section.settings || {}}
        variant={section.variant}
        onChange={onChange}
        onVariantChange={handleVariantChange}
      />
    );
  }

  // Fallback for any unexpected custom section type
  const settings = section.settings || {};
  const keys = Object.keys(settings).filter((k) => k !== "_advanced");

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h4 className="font-semibold text-slate-200 capitalize">
          {section.type.replace(/_/g, " ")} Settings
        </h4>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Configure section properties and display options.
        </p>
      </div>

      {keys.length === 0 ? (
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-800/40 text-slate-400 text-xs">
          This section uses default page presets.
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => {
            const val = settings[key];
            const label = key.replace(/_/g, " ");

            if (typeof val === "boolean") {
              return (
                <label key={key} className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) =>
                      onChange({
                        settings: {
                          ...settings,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
                  />
                  <span className="capitalize">{label}</span>
                </label>
              );
            }

            return (
              <div key={key} className="space-y-1">
                <label className="text-slate-300 capitalize">{label}</label>
                <input
                  type={typeof val === "number" ? "number" : "text"}
                  value={val ?? ""}
                  onChange={(e) =>
                    onChange({
                      settings: {
                        ...settings,
                        [key]: typeof val === "number" ? Number(e.target.value) : e.target.value,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SectionSettings;
