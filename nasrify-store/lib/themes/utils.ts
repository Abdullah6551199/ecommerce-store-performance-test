/**
 * Themes Utility Helpers (Stage 42.5b)
 * Text sizing, rich text sanitization, and image crop styling.
 */

export function getHeadingSizeClass(size?: string): string {
  switch (size) {
    case "sm":
      return "text-xl sm:text-2xl";
    case "md":
      return "text-2xl sm:text-3xl";
    case "lg":
      return "text-3xl sm:text-4xl";
    case "xl":
      return "text-4xl sm:text-5xl lg:text-6xl";
    case "2xl":
      return "text-5xl sm:text-6xl lg:text-7xl";
    case "3xl":
      return "text-6xl sm:text-7xl lg:text-8xl";
    default:
      return "text-3xl sm:text-5xl lg:text-6xl";
  }
}

export function getSubheadingSizeClass(size?: string): string {
  switch (size) {
    case "sm":
      return "text-sm sm:text-base";
    case "md":
      return "text-base sm:text-lg";
    case "lg":
      return "text-lg sm:text-xl";
    case "xl":
      return "text-xl sm:text-2xl";
    case "2xl":
      return "text-2xl sm:text-3xl";
    case "3xl":
      return "text-3xl sm:text-4xl";
    default:
      return "text-base sm:text-xl";
  }
}

export function getButtonSizeClass(size?: string): string {
  switch (size) {
    case "sm":
      return "px-5 py-2.5 text-xs";
    case "md":
      return "px-7 py-3.5 text-sm";
    case "lg":
      return "px-8 py-4 text-base";
    case "xl":
      return "px-10 py-5 text-lg font-bold";
    default:
      return "px-8 py-4 text-base";
  }
}

/**
 * Sanitizes rich text HTML for safe rendering via dangerouslySetInnerHTML
 */
export function sanitizeRichText(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^>\s]+/gi, "")
    .replace(/javascript\s*:/gi, "");
}

export interface CropData {
  aspectRatio?: string; // "free" | "1:1" | "16:9" | "4:3" | "3:2"
  position?: string; // "top-left", "center", etc.
  zoom?: number; // 100 - 200 (%)
  fit?: "cover" | "contain" | "fill";
}

/**
 * Returns CSS styles derived from crop_data
 */
export function getImageCropStyle(cropData?: CropData): React.CSSProperties {
  if (!cropData) return {};
  const style: React.CSSProperties = {};

  if (cropData.fit) {
    style.objectFit = cropData.fit;
  }
  if (cropData.position) {
    // Map position names to CSS values
    const posMap: Record<string, string> = {
      "top-left": "top left",
      "top-center": "top center",
      "top-right": "top right",
      "center-left": "center left",
      center: "center center",
      "center-right": "center right",
      "bottom-left": "bottom left",
      "bottom-center": "bottom center",
      "bottom-right": "bottom right",
    };
    style.objectPosition = posMap[cropData.position] || cropData.position;
  }
  if (cropData.zoom && cropData.zoom > 100) {
    style.transform = `scale(${cropData.zoom / 100})`;
  }

  return style;
}
