"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { HERO_SCHEMA } from "@/lib/themes/schemas/hero";

interface HeroSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function HeroSettings(props: HeroSettingsProps) {
  return <BaseSectionSettings schema={HERO_SCHEMA} {...props} />;
}

export default HeroSettings;
