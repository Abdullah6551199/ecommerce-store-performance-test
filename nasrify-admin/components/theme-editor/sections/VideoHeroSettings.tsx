"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { VIDEO_HERO_SCHEMA } from "@/lib/themes/schemas/video-hero";

interface VideoHeroSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function VideoHeroSettings(props: VideoHeroSettingsProps) {
  return <BaseSectionSettings schema={VIDEO_HERO_SCHEMA} {...props} />;
}

export default VideoHeroSettings;
