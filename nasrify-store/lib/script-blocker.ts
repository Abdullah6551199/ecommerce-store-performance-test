/**
 * GDPR & ePrivacy Compliant Script Blocker & Cookie Consent Manager
 */

export type CookieConsentCategory = "necessary" | "analytics" | "marketing" | "functional";

export interface CookieConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: string;
  version: string;
}

export const COOKIE_CONSENT_STORAGE_KEY = "cookie_consent_v1";
export const COOKIE_CONSENT_EVENT = "apex_cookie_consent_updated";

/**
 * Retrieve current cookie consent state from browser localStorage
 */
export function getStoredCookieConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as CookieConsentState;
    }
  } catch (err) {
    console.warn("Failed to parse stored cookie consent:", err);
  }
  return null;
}

/**
 * Verification helper for script execution authorization
 */
export function shouldLoadScript(category: "analytics" | "marketing" | "functional"): boolean {
  if (typeof window === "undefined") return false;
  const consent = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (!consent) return false;
  try {
    const parsed = JSON.parse(consent);
    return parsed[category] === true;
  } catch {
    return false;
  }
}

/**
 * Save cookie consent choices to localStorage and trigger global window notification
 */
export function saveCookieConsent(preferences: {
  analytics?: boolean;
  marketing?: boolean;
  functional?: boolean;
}): CookieConsentState {
  const payload: CookieConsentState = {
    necessary: true,
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    functional: Boolean(preferences.functional),
    timestamp: new Date().toISOString(),
    version: "v1",
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_EVENT, { detail: payload })
      );

      // Async log to audit trail
      fetch("/api/cookie-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (e) {
      console.warn("Could not save cookie consent to localStorage:", e);
    }
  }

  return payload;
}
