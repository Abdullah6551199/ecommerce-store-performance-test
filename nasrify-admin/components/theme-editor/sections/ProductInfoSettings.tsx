"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { PRODUCT_INFO_SCHEMA } from "@/lib/themes/schemas/product-info";

interface ProductInfoSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function ProductInfoSettings(props: ProductInfoSettingsProps) {
  return <BaseSectionSettings schema={PRODUCT_INFO_SCHEMA} {...props} />;
}

export default ProductInfoSettings;
