"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { BANNER_SCHEMA } from "@/lib/themes/schemas/banner";

interface BannerSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function BannerSettings(props: BannerSettingsProps) {
  return <BaseSectionSettings schema={BANNER_SCHEMA} {...props} />;
}

export default BannerSettings;
