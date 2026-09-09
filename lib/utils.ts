import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind and custom CSS class names cleanly.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes an image URL to ensure it loads properly across the storefront and admin:
 * 1. Rewrites legacy dead domain `assets.ecommerce-store.workers.dev` to `/api/media/`
 * 2. Rewrites raw S3/R2 endpoints `*.r2.cloudflarestorage.com` to `/api/media/`
 * 3. Enriches Unsplash URLs with optimal dimensions/format (`?auto=format&fit=crop&w=800&q=80`)
 * 4. Handles relative /api/media URLs cleanly
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return "";
  }

  const trimmed = url.trim();

  // Rewrite legacy dead assets subdomain
  if (trimmed.includes("assets.ecommerce-store.workers.dev/")) {
    const parts = trimmed.split("assets.ecommerce-store.workers.dev/");
    return `/api/media/${parts[1].replace(/^\//, "")}`;
  }

  // Rewrite raw R2 storage endpoint
  if (trimmed.includes(".r2.cloudflarestorage.com/")) {
    const parts = trimmed.split(".r2.cloudflarestorage.com/");
    return `/api/media/${parts[1].replace(/^\//, "")}`;
  }

  // Optimize Unsplash images
  if (trimmed.includes("images.unsplash.com") && !trimmed.includes("auto=format")) {
    const separator = trimmed.includes("?") ? "&" : "?";
    return `${trimmed}${separator}auto=format&fit=crop&w=800&q=80`;
  }

  return trimmed;
}

