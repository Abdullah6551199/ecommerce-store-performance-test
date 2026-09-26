"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { ANNOUNCEMENT_SCHEMA } from "@/lib/themes/schemas/announcement";

interface AnnouncementSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function AnnouncementSettings(props: AnnouncementSettingsProps) {
  return <BaseSectionSettings schema={ANNOUNCEMENT_SCHEMA} {...props} />;
}

export default AnnouncementSettings;
