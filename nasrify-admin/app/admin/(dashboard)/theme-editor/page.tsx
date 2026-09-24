import React from "react";
import { ThemeEditorShell } from "@/components/theme-editor/ThemeEditorShell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visual Theme Editor | Nasrify Admin",
  description: "Customize storefront themes, layouts, and colors with live preview",
};

export default function ThemeEditorPage() {
  return <ThemeEditorShell />;
}
