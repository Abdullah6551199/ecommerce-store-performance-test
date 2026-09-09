import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind and custom CSS class names cleanly.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export interface NormalizeImageOptions {
  width?: number;
  quality?: number;
  hero?: boolean;
}

/**
 * Normalizes an image URL to ensure it loads properly across the storefront and admin:
 * 1. Rewrites legacy dead domain `assets.ecommerce-store.workers.dev` to `/api/media/`
 * 2. Rewrites raw S3/R2 endpoints `*.r2.cloudflarestorage.com` to `/api/media/`
 * 3. Enriches Unsplash URLs with optimal dimensions/format (w=800&q=75 or hero w=1600&q=70)
 * 4. Handles relative /api/media URLs and appends ?w= for edge resizing
 */
export function normalizeImageUrl(
  url: string | null | undefined,
  options?: NormalizeImageOptions
): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return "";
  }

  let trimmed = url.trim();

  // Rewrite legacy dead assets subdomain
  if (trimmed.includes("assets.ecommerce-store.workers.dev/")) {
    const parts = trimmed.split("assets.ecommerce-store.workers.dev/");
    trimmed = `/api/media/${parts[1].replace(/^\//, "")}`;
  }

  // Rewrite raw R2 storage endpoint
  if (trimmed.includes(".r2.cloudflarestorage.com/")) {
    const parts = trimmed.split(".r2.cloudflarestorage.com/");
    trimmed = `/api/media/${parts[1].replace(/^\//, "")}`;
  }

  // Optimize Unsplash images with required Stage 3 compression & sizing
  if (trimmed.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(trimmed);
      const targetWidth = options?.width || (options?.hero ? 1600 : 800);
      const targetQuality = options?.quality || (options?.hero ? 70 : 75);

      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("w", String(targetWidth));
      parsed.searchParams.set("q", String(targetQuality));

      return parsed.toString();
    } catch {
      // Fallback if URL parsing fails
      const targetWidth = options?.width || (options?.hero ? 1600 : 800);
      const targetQuality = options?.quality || (options?.hero ? 70 : 75);
      const cleanUrl = trimmed.split("?")[0];
      return `${cleanUrl}?auto=format&fit=crop&w=${targetWidth}&q=${targetQuality}`;
    }
  }

  // For internal R2 media endpoints, append width parameter if specified
  if (trimmed.startsWith("/api/media/") && options?.width) {
    const separator = trimmed.includes("?") ? "&" : "?";
    if (!trimmed.includes("w=")) {
      return `${trimmed}${separator}w=${options.width}`;
    }
  }

  return trimmed;
}

