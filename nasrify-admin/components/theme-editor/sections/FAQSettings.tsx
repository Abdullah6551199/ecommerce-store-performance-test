"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { FAQ_SCHEMA } from "@/lib/themes/schemas/faq";

interface FAQSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function FAQSettings(props: FAQSettingsProps) {
  return <BaseSectionSettings schema={FAQ_SCHEMA} {...props} />;
}

export default FAQSettings;
