"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { PRICING_TABLE_SCHEMA } from "@/lib/themes/schemas/pricing-table";

interface PricingTableSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function PricingTableSettings(props: PricingTableSettingsProps) {
  return <BaseSectionSettings schema={PRICING_TABLE_SCHEMA} {...props} />;
}

export default PricingTableSettings;
