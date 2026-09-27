import { useMemo } from "react";
import { ComponentSchema } from "@/lib/themes/component-schema";

export interface UseComponentSettingsProps {
  schema: ComponentSchema;
  componentId: string;
  sectionSettings: Record<string, any>;
  onSectionChange: (updatedSectionSettings: Record<string, any>) => void;
}

export function useComponentSettings({
  schema,
  componentId,
  sectionSettings = {},
  onSectionChange,
}: UseComponentSettingsProps) {
  // Retrieve the component entry from sectionSettings._components[componentId]
  const componentsMap = (sectionSettings._components || {}) as Record<string, any>;
  const componentData = (componentsMap[componentId] || {}) as Record<string, any>;

  // Merge defaults with saved content settings
  // Also check if sectionSettings has a direct field named componentId (e.g. sectionSettings.heading)
  const initialContent = useMemo(() => {
    const directFallback = sectionSettings[componentId];
    const fallbackSettings =
      directFallback !== undefined && typeof directFallback !== "object"
        ? { [schema.content[0]?.key || "text"]: directFallback }
        : typeof directFallback === "object"
        ? directFallback
        : {};

    return {
      ...(schema.defaults || {}),
      ...fallbackSettings,
      ...(componentData.settings || {}),
    };
  }, [schema.defaults, schema.content, sectionSettings, componentId, componentData.settings]);

  const currentVariant =
    componentData.variant ||
    initialContent.variant ||
    schema.variants?.[0]?.value ||
    "default";

  const componentStyle = useMemo(() => {
    return {
      ...(schema.defaultStyle || {}),
      ...(componentData._style || componentData.style || {}),
    };
  }, [schema.defaultStyle, componentData._style, componentData.style]);

  const componentAdvanced = useMemo(() => {
    return {
      ...(schema.defaultAdvanced || {}),
      ...(componentData._advanced || componentData.advanced || {}),
    };
  }, [schema.defaultAdvanced, componentData._advanced, componentData.advanced]);

  // Helper to commit component changes to parent sectionSettings
  const commitComponent = (updatedComponent: Record<string, any>) => {
    const nextComponents = {
      ...componentsMap,
      [componentId]: {
        ...componentData,
        type: schema.type,
        ...updatedComponent,
      },
    };

    onSectionChange({
      ...sectionSettings,
      _components: nextComponents,
    });
  };

  // Content field change handler
  const setFieldValue = (key: string, value: any) => {
    const nextSettings = {
      ...initialContent,
      [key]: value,
    };

    // If the section directly had this property (e.g. sectionSettings.heading), also update it for backward compat!
    const patch: Record<string, any> = {
      ...sectionSettings,
      _components: {
        ...componentsMap,
        [componentId]: {
          ...componentData,
          type: schema.type,
          settings: nextSettings,
          _style: componentStyle,
          _advanced: componentAdvanced,
        },
      },
    };

    if (schema.content.length === 1 && schema.content[0].key === key && sectionSettings[componentId] !== undefined) {
      patch[componentId] = value;
    }

    onSectionChange(patch);
  };

  const setFields = (fieldsPatch: Record<string, any>) => {
    const nextSettings = {
      ...initialContent,
      ...fieldsPatch,
    };
    commitComponent({
      settings: nextSettings,
      _style: componentStyle,
      _advanced: componentAdvanced,
    });
  };

  const setVariant = (newVariant: string) => {
    commitComponent({
      variant: newVariant,
      settings: {
        ...initialContent,
        variant: newVariant,
      },
      _style: componentStyle,
      _advanced: componentAdvanced,
    });
  };

  const setStyle = (stylePatch: Record<string, any>) => {
    const nextStyle = {
      ...componentStyle,
      ...stylePatch,
    };
    commitComponent({
      settings: initialContent,
      _style: nextStyle,
      _advanced: componentAdvanced,
    });
  };

  const setAdvanced = (advancedPatch: Record<string, any>) => {
    const nextAdvanced = {
      ...componentAdvanced,
      ...advancedPatch,
    };
    commitComponent({
      settings: initialContent,
      _style: componentStyle,
      _advanced: nextAdvanced,
    });
  };

  const applyPreset = (preset: any) => {
    commitComponent({
      settings: {
        ...initialContent,
        ...(preset.settings || {}),
      },
      variant: preset.settings?.variant || componentData.variant,
      _style: {
        ...componentStyle,
        ...(preset.style || {}),
      },
      _advanced: {
        ...componentAdvanced,
        ...(preset.advanced || {}),
      },
    });
  };

  return {
    contentSettings: initialContent,
    variant: currentVariant,
    style: componentStyle,
    advanced: componentAdvanced,
    setFieldValue,
    setFields,
    setVariant,
    setStyle,
    setAdvanced,
    applyPreset,
  };
}
