import { getR2Bucket } from "@/lib/db";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
] as const;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

export type AllowedMimeType = (typeof ALLOWED_IMAGE_TYPES)[number];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadResult {
  id: string;
  key: string;
  url: string;
  size: number;
  type: string;
  altText?: string;
}

/**
 * Validate image file for theme preview / screenshot
 */
export function validateUploadFile(file: { size: number; type: string }): FileValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of 5MB`,
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedMimeType)) {
    return {
      valid: false,
      error: `Unsupported file type "${file.type}". Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Generate asset URL
 */
export function getAssetUrl(key: string): string {
  const cleanKey = key.replace(/^\//, "");
  return `/api/media/${cleanKey}`;
}

/**
 * Upload file to Cloudflare R2 bucket
 */
export async function uploadThemeAsset(
  file: File | Blob,
  folder = "themes",
  metadata: { altText?: string; customId?: string } = {}
): Promise<UploadResult> {
  const validation = validateUploadFile({ size: file.size, type: file.type });
  if (!validation.valid) {
    throw new Error(validation.error || "File validation failed");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileExtension = file.type.split("/")[1]?.replace("jpeg", "jpg").replace("svg+xml", "svg") || "bin";
  const uniqueId = metadata.customId || crypto.randomUUID();
  const key = `${folder.replace(/\/$/, "")}/${uniqueId}.${fileExtension}`;
  const publicUrl = getAssetUrl(key);

  const nativeR2 = getR2Bucket();
  if (nativeR2) {
    await nativeR2.put(key, buffer, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: metadata.altText ? { altText: metadata.altText } : undefined,
    });

    return {
      id: uniqueId,
      key,
      url: publicUrl,
      size: file.size,
      type: file.type,
      altText: metadata.altText,
    };
  }

  // Local / dev fallback simulation
  return {
    id: uniqueId,
    key,
    url: publicUrl,
    size: file.size,
    type: file.type,
    altText: metadata.altText,
  };
}
