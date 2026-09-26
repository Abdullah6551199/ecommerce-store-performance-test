"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { NEWSLETTER_SCHEMA } from "@/lib/themes/schemas/newsletter";

interface NewsletterSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function NewsletterSettings(props: NewsletterSettingsProps) {
  return <BaseSectionSettings schema={NEWSLETTER_SCHEMA} {...props} />;
}

export default NewsletterSettings;
