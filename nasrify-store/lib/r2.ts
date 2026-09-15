import { env } from "@/config/env";

/**
 * Cloudflare R2 Storage Service using native Cloudflare Workers API.
 * Supports:
 * 1. Cloudflare Workers native R2 binding (env.R2 via OpenNext getCloudflareContext)
 * 2. Local fallback storage simulation for development and testing
 */

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

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

export interface R2HealthResult {
  configured: boolean;
  provider: "cloudflare-worker-binding" | "local-simulation";
  bucket: string;
  message: string;
}

/**
 * Validate file against allowed MIME types and max size limit (5MB)
 */
export function validateUploadFile(
  file: { size: number; type: string }
): FileValidationResult {
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
 * Retrieve native Cloudflare Workers R2Bucket binding if available
 */
export function getNativeR2Bucket(): R2Bucket | null {
  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.R2) {
      return ctx.env.R2 as R2Bucket;
    }
  } catch (_err) {
    // Context unavailable in standard Next.js dev / build environment
  }

  const globalAny = globalThis as unknown as { env?: { R2?: R2Bucket }; R2?: R2Bucket };
  if (globalAny?.env?.R2) return globalAny.env.R2;
  if (globalAny?.R2) return globalAny.R2;

  return null;
}

/**
 * Generate public URL for an asset key
 */
export function getPublicUrl(key: string): string {
  const cleanKey = key.replace(/^\//, "");
  if (env.r2.publicUrl && !env.r2.publicUrl.includes("assets.ecommerce-store.workers.dev")) {
    return `${env.r2.publicUrl.replace(/\/$/, "")}/${cleanKey}`;
  }
  return `/api/media/${cleanKey}`;
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadFile(
  file: File | Blob,
  folder = "uploads",
  metadata: { altText?: string; customId?: string } = {}
): Promise<UploadResult> {
  // Validate file
  const validation = validateUploadFile({ size: file.size, type: file.type });
  if (!validation.valid) {
    throw new Error(validation.error || "File validation failed");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileExtension = file.type.split("/")[1]?.replace("jpeg", "jpg") || "bin";
  const uniqueId = metadata.customId || crypto.randomUUID();
  const key = `${folder.replace(/\/$/, "")}/${uniqueId}.${fileExtension}`;
  const publicUrl = getPublicUrl(key);

  // 1. Try native Cloudflare R2 binding
  const nativeR2 = getNativeR2Bucket();
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

  // 2. Development simulation fallback
  console.info(`[R2 Simulation] Stored upload: ${key} (${file.size} bytes, ${file.type})`);
  return {
    id: uniqueId,
    key,
    url: publicUrl,
    size: file.size,
    type: file.type,
    altText: metadata.altText,
  };
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFile(key: string): Promise<boolean> {
  const nativeR2 = getNativeR2Bucket();
  if (nativeR2) {
    await nativeR2.delete(key);
    return true;
  }

  console.info(`[R2 Simulation] Deleted asset: ${key}`);
  return true;
}

/**
 * Check health status of Cloudflare R2 storage
 */
export async function checkR2Health(): Promise<R2HealthResult> {
  const bucketName = env.r2.bucketName || "ecommerce-store-assets";
  const nativeR2 = getNativeR2Bucket();

  if (nativeR2) {
    return {
      configured: true,
      provider: "cloudflare-worker-binding",
      bucket: bucketName,
      message: "Native Cloudflare R2 Worker binding is active",
    };
  }

  return {
    configured: true,
    provider: "local-simulation",
    bucket: bucketName,
    message: "Local R2 simulation ready (enable Cloudflare R2 in dashboard for remote production storage)",
  };
}
