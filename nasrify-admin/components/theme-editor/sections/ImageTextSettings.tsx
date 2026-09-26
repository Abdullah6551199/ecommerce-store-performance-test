"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { IMAGE_TEXT_SCHEMA } from "@/lib/themes/schemas/image-text";

interface ImageTextSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function ImageTextSettings(props: ImageTextSettingsProps) {
  return <BaseSectionSettings schema={IMAGE_TEXT_SCHEMA} {...props} />;
}

export default ImageTextSettings;
