import { AppManifestSchema, type AppManifest } from "@/types/apps";

/**
 * Runtime Manifest Validator
 */
export function validateManifest(manifest: unknown): {
  valid: boolean;
  errors?: string[];
  data?: AppManifest;
} {
  const result = AppManifestSchema.safeParse(manifest);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
    };
  }
  return {
    valid: true,
    data: result.data as AppManifest,
  };
}
