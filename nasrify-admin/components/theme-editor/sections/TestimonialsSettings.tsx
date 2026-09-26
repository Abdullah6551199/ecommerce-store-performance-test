"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { TESTIMONIALS_SCHEMA } from "@/lib/themes/schemas/testimonials";

interface TestimonialsSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function TestimonialsSettings(props: TestimonialsSettingsProps) {
  return <BaseSectionSettings schema={TESTIMONIALS_SCHEMA} {...props} />;
}

export default TestimonialsSettings;
