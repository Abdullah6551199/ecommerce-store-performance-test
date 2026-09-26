import { useMemo } from "react";
import { SectionSchema } from "@/lib/themes/section-schema";

export interface UseSectionSettingsProps {
  schema: SectionSchema;
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function useSectionSettings({
  schema,
  settings = {},
  variant,
  onChange,
  onVariantChange,
}: UseSectionSettingsProps) {
  // Merge defaults with actual settings
  const mergedSettings = useMemo(() => {
    return {
      ...(schema.defaults || {}),
      ...settings,
    };
  }, [schema.defaults, settings]);

  const currentVariant = variant || mergedSettings.variant || schema.variants?.[0]?.value || "default";

  // Content field change handler
  const setFieldValue = (key: string, value: any) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  // Multiple fields change handler
  const setFields = (patch: Record<string, any>) => {
    onChange({
      ...settings,
      ...patch,
    });
  };

  // Variant change handler
  const setVariant = (newVariant: string) => {
    if (onVariantChange) {
      onVariantChange(newVariant);
    }
    onChange({
      ...settings,
      variant: newVariant,
    });
  };

  // Advanced / Style change handler
  const advanced = (settings._advanced || {}) as Record<string, any>;
  const advancedStyle = advanced.style || {};

  const setAdvanced = (advancedPatch: Record<string, any>) => {
    onChange({
      ...settings,
      _advanced: {
        ...advanced,
        ...advancedPatch,
      },
    });
  };

  const setAdvancedStyle = (stylePatch: Record<string, any>) => {
    setAdvanced({
      style: {
        ...advancedStyle,
        ...stylePatch,
      },
    });
  };

  // Apply preset handler
  const applyPreset = (preset: any) => {
    if (preset.variant && onVariantChange) {
      onVariantChange(preset.variant);
    }
    onChange({
      ...settings,
      ...preset.settings,
    });
  };

  return {
    settings: mergedSettings,
    variant: currentVariant,
    advanced,
    advancedStyle,
    setFieldValue,
    setFields,
    setVariant,
    setAdvanced,
    setAdvancedStyle,
    applyPreset,
  };
}
