"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { HEADER_SCHEMA } from "@/lib/themes/schemas/header";

interface HeaderSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function HeaderSettings(props: HeaderSettingsProps) {
  return <BaseSectionSettings schema={HEADER_SCHEMA} {...props} />;
}

export default HeaderSettings;
