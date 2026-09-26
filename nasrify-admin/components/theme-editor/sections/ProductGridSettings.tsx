"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { PRODUCT_GRID_SCHEMA } from "@/lib/themes/schemas/product-grid";

interface ProductGridSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function ProductGridSettings(props: ProductGridSettingsProps) {
  return <BaseSectionSettings schema={PRODUCT_GRID_SCHEMA} {...props} />;
}

export default ProductGridSettings;
