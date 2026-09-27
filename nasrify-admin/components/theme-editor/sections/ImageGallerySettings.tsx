"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { IMAGE_GALLERY_SCHEMA } from "@/lib/themes/schemas/image-gallery";

interface ImageGallerySettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function ImageGallerySettings(props: ImageGallerySettingsProps) {
  return <BaseSectionSettings schema={IMAGE_GALLERY_SCHEMA} {...props} />;
}

export default ImageGallerySettings;
