"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { CATEGORIES_SCHEMA } from "@/lib/themes/schemas/categories";

interface CategoriesSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function CategoriesSettings(props: CategoriesSettingsProps) {
  return <BaseSectionSettings schema={CATEGORIES_SCHEMA} {...props} />;
}

export default CategoriesSettings;
