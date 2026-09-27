"use client";

import React from "react";
import { getComponentSchema, ComponentSchema } from "@/lib/themes/component-schema";
import { BaseComponent } from "./BaseComponent";

export interface BaseComponentSettingsProps {
  componentId: string;
  componentType: string;
  sectionSettings: Record<string, any>;
  onSectionChange: (updatedSettings: Record<string, any>) => void;
  activeTab?: "content" | "style" | "advanced";
  onBack?: () => void;
}

export function BaseComponentSettings({
  componentId,
  componentType,
  sectionSettings,
  onSectionChange,
  activeTab,
  onBack,
}: BaseComponentSettingsProps) {
  // Resolve schema from COMPONENT_SCHEMAS
  const schema: ComponentSchema = getComponentSchema(componentType) || {
    type: componentType,
    label: componentType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    category: "basic",
    content: [
      {
        key: "text",
        type: "richtext",
        label: "Content",
        default: "",
      },
    ],
    defaults: {
      text: "",
    },
  };

  return (
    <BaseComponent
      componentId={componentId}
      schema={schema}
      sectionSettings={sectionSettings}
      onSectionChange={onSectionChange}
      activeTab={activeTab}
      onBack={onBack}
    />
  );
}
