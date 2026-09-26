"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { FOOTER_SCHEMA } from "@/lib/themes/schemas/footer";

interface FooterSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function FooterSettings(props: FooterSettingsProps) {
  return <BaseSectionSettings schema={FOOTER_SCHEMA} {...props} />;
}

export default FooterSettings;
