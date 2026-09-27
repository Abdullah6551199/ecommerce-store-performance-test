"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { STATS_COUNTERS_SCHEMA } from "@/lib/themes/schemas/stats-counters";

interface StatsCountersSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function StatsCountersSettings(props: StatsCountersSettingsProps) {
  return <BaseSectionSettings schema={STATS_COUNTERS_SCHEMA} {...props} />;
}

export default StatsCountersSettings;
