/**
 * Cryptographic Token and License Key Utilities for Digital Products
 */

const TOKEN_SECRET = process.env.SESSION_SECRET || "digital-products-secret-key-38";

/**
 * Generate a cryptographically secure, signed download token
 */
export async function generateDownloadToken(): Promise<string> {
  const randomPart = crypto.randomUUID().replace(/-/g, "");
  const timestamp = Date.now().toString(36);
  const raw = `${randomPart}.${timestamp}`;

  // Generate HMAC signature using Web Crypto API
  const encoder = new TextEncoder();
  const keyData = encoder.encode(TOKEN_SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(raw));
  const sigHex = Array.from(new Uint8Array(signature))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${raw}.${sigHex}`;
}

/**
 * Verify download token signature
 */
export async function verifyDownloadTokenSignature(token: string): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [randomPart, timestamp, sigHex] = parts;
  const raw = `${randomPart}.${timestamp}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(TOKEN_SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(raw));
  const expectedSigHex = Array.from(new Uint8Array(signature))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return sigHex === expectedSigHex;
}

/**
 * Generate a formatted license key (XXXX-XXXX-XXXX-XXXX)
 */
export function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // excludes 0, O, 1, I for legibility
  const groups: string[] = [];

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  for (let g = 0; g < 4; g++) {
    let group = "";
    for (let c = 0; c < 4; c++) {
      const idx = bytes[g * 4 + c] % chars.length;
      group += chars[idx];
    }
    groups.push(group);
  }

  return groups.join("-");
}
