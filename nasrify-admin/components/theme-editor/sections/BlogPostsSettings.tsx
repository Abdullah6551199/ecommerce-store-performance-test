"use client";

import React from "react";
import { BaseSectionSettings } from "../base";
import { BLOG_POSTS_SCHEMA } from "@/lib/themes/schemas/blog-posts";

interface BlogPostsSettingsProps {
  settings?: Record<string, any>;
  variant?: string;
  onChange: (patch: Record<string, any>) => void;
  onVariantChange?: (variant: string) => void;
}

export function BlogPostsSettings(props: BlogPostsSettingsProps) {
  return <BaseSectionSettings schema={BLOG_POSTS_SCHEMA} {...props} />;
}

export default BlogPostsSettings;
