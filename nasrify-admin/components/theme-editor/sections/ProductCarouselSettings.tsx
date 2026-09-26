"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { PRODUCT_CAROUSEL_SCHEMA } from "@/lib/themes/schemas/product-carousel";

interface ProductCarouselSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function ProductCarouselSettings(props: ProductCarouselSettingsProps) {
  return <BaseSectionSettings schema={PRODUCT_CAROUSEL_SCHEMA} {...props} />;
}

export default ProductCarouselSettings;
