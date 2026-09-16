import { AppManifestSchema, type AppManifest } from "@/types/apps";

/**
 * Human-Friendly Runtime Manifest Validator
 * Produces clean, readable errors such as:
 * "apps/my-app/manifest.json: missing required field 'name'"
 */
export function validateManifest(
  manifest: unknown,
  appId?: string
): {
  valid: boolean;
  errors?: string[];
  data?: AppManifest;
} {
  const idFromManifest =
    manifest && typeof manifest === "object" && "id" in manifest
      ? String((manifest as any).id)
      : appId || "app";
  const prefix = `apps/${idFromManifest}/manifest.json`;

  const result = AppManifestSchema.safeParse(manifest);

  if (!result.success) {
    const formattedErrors = result.error.issues.map((issue) => {
      const field = issue.path.join(".");
      const isMissing =
        (issue.code === "invalid_type" &&
          ((issue as any).received === "undefined" ||
            (issue as any).data === undefined ||
            issue.message.includes("received undefined"))) ||
        issue.message.toLowerCase().includes("required");

      if (isMissing) {
        return `${prefix}: missing required field '${field}'`;
      }
      return `${prefix}: invalid field '${field}' — ${issue.message}`;
    });

    return {
      valid: false,
      errors: formattedErrors,
    };
  }

  return {
    valid: true,
    data: result.data as AppManifest,
  };
}
