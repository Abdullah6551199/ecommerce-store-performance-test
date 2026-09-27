"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { TEAM_MEMBERS_SCHEMA } from "@/lib/themes/schemas/team-members";

interface TeamMembersSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function TeamMembersSettings(props: TeamMembersSettingsProps) {
  return <BaseSectionSettings schema={TEAM_MEMBERS_SCHEMA} {...props} />;
}

export default TeamMembersSettings;
