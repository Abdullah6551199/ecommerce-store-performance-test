import { cache } from "react";
import { eq } from "drizzle-orm";
import {
  getDb,
  cookieConsentSettings,
  type CookieConsentSettingRecord,
  type NewCookieConsentSettingRecord,
} from "@/lib/db";
import { sendStorefrontInvalidation } from "@/lib/storefront-invalidation";
import type {
  CookieConsentSettingItem,
  UpdateCookieConsentInput,
  CookieConsentState,
  CookieConsentStats,
} from "../shared/types";

export const COOKIE_CONSENT_KEY = "nasrify_cookie_consent";
export const COOKIE_CONSENT_NAME = "cookie_consent";

export function getDefaultCookiePolicyContent(): string {
  return `
# Cookie Policy

**Last Updated:** September 19, 2026

Welcome to Nasrify. This Cookie Policy explains how we use cookies and similar tracking technologies when you visit our website, and how you can manage your preferences in compliance with the General Data Protection Regulation (GDPR) and the ePrivacy Directive.

---

### 1. What Are Cookies?
Cookies are small text files that are stored on your device (computer, smartphone, or tablet) when you browse websites. They are widely used to make websites work efficiently, enhance your user experience, remember your preferences, and provide analytical reporting to website owners.

---

### 2. How We Use Cookies
Nasrify uses cookies for several vital purposes:
- Enabling core site functionality such as secure cart checkout, user authentication, and CSRF protection.
- Remembering your preferred settings, theme mode (Light/Dark), and recently compared items.
- Understanding how visitors interact with our pages to continuously enhance browsing speed, navigation, and catalog discovery.
- Displaying relevant recommendations, promotional broadcasts, and targeted messages aligned with your shopping interests.

---

### 3. Categories of Cookies We Use

| Category | Purpose | Necessity | Default Status |
|---|---|---|---|
| **Necessary Cookies** | Essential for navigating the site and utilizing core features like the shopping bag, checkout session, and security controls. | Mandatory | **Always Active** |
| **Functional Cookies** | Remember your custom preferences, selected currency, active theme mode, and wishlist state. | Optional | **Consent Required** |
| **Analytics Cookies** | Collect aggregated, anonymous metrics regarding traffic, bounce rates, and popular landing pages to improve store performance. | Optional | **Consent Required** |
| **Marketing Cookies** | Used to measure campaign effectiveness and deliver personalized product advertisements across third-party platforms. | Optional | **Consent Required** |

---

### 4. How to Manage and Control Cookies
You have complete control over non-essential cookies. You can:
1. **Use Our Cookie Banner & Preferences Modal:** Customize your consent choices at any time directly through the "Cookie Settings" link in our website footer.
2. **Browser Settings:** Adjust your browser preferences to block or alert you about cookies. Note that disabling necessary cookies may prevent certain features (such as adding items to cart or completing orders) from functioning correctly.

---

### 5. Third-Party Scripts & GDPR Compliance
Under our strict zero-consent-leak policy, all third-party tracking scripts (including Google Analytics, Meta Pixel, and TikTok Pixel) remain completely blocked from loading or executing until you grant explicit consent for their respective categories.

---

### 6. Contact Us
If you have questions about our Cookie Policy or data privacy practices, please contact our Data Protection team at:
- **Email:** privacy@nasrify.com
- **Support:** support@nasrify.com
- **Website:** [Nasrify Contact Page](/contact)
`.trim();
}

export const memoryCookieSettings: CookieConsentSettingItem = {
  id: "cookies_default",
  tenantId: null,
  isEnabled: true,
  bannerTitle: "We use cookies",
  bannerMessage:
    "We use cookies to improve your experience, analyze traffic, and personalize content.",
  acceptText: "Accept All",
  rejectText: "Reject All",
  customizeText: "Customize",
  position: "bottom",
  theme: "auto",
  analyticsEnabled: true,
  marketingEnabled: true,
  functionalEnabled: true,
  cookiePolicyContent: getDefaultCookiePolicyContent(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// 20-second micro-cache
const COOKIE_SETTINGS_TTL_MS = 20_000;
let cachedCookieSettings: CookieConsentSettingItem | null = null;
let lastCookieSettingsFetchTime = 0;

export function invalidateCookieSettingsCache(): void {
  cachedCookieSettings = null;
  lastCookieSettingsFetchTime = 0;
}

/**
 * Trigger cross-worker invalidation non-blockingly
 */
function triggerCrossWorkerInvalidation(): void {
  try {
    sendStorefrontInvalidation({
      target: "cookie-consent",
    }).catch(() => {});
  } catch (_e) {
    // Non-blocking
  }
}

/**
 * Strict column selection for cookie consent settings (no SELECT *)
 */
const COOKIE_SETTINGS_COLUMNS = {
  id: cookieConsentSettings.id,
  tenantId: cookieConsentSettings.tenantId,
  isEnabled: cookieConsentSettings.isEnabled,
  bannerTitle: cookieConsentSettings.bannerTitle,
  bannerMessage: cookieConsentSettings.bannerMessage,
  acceptText: cookieConsentSettings.acceptText,
  rejectText: cookieConsentSettings.rejectText,
  customizeText: cookieConsentSettings.customizeText,
  position: cookieConsentSettings.position,
  theme: cookieConsentSettings.theme,
  analyticsEnabled: cookieConsentSettings.analyticsEnabled,
  marketingEnabled: cookieConsentSettings.marketingEnabled,
  functionalEnabled: cookieConsentSettings.functionalEnabled,
  cookiePolicyContent: cookieConsentSettings.cookiePolicyContent,
  createdAt: cookieConsentSettings.createdAt,
  updatedAt: cookieConsentSettings.updatedAt,
};

/**
 * Fetch cookie consent settings from D1 or fallback memory
 * Deduplicated via React.cache and 20s in-memory TTL
 */
export const getCookieConsentSettings = cache(async (): Promise<CookieConsentSettingItem> => {
  if (
    cachedCookieSettings &&
    Date.now() - lastCookieSettingsFetchTime < COOKIE_SETTINGS_TTL_MS
  ) {
    return cachedCookieSettings;
  }

  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select(COOKIE_SETTINGS_COLUMNS)
        .from(cookieConsentSettings)
        .limit(1);

      if (rows.length > 0) {
        const row = rows[0] as CookieConsentSettingItem;
        if (!row.cookiePolicyContent) {
          row.cookiePolicyContent = getDefaultCookiePolicyContent();
        }
        cachedCookieSettings = row;
        lastCookieSettingsFetchTime = Date.now();
        return row;
      }
    } catch (error) {
      // Memory fallback
    }
  }

  return { ...memoryCookieSettings };
});

/**
 * Update cookie consent settings
 */
export async function updateCookieConsentSettings(
  input: UpdateCookieConsentInput
): Promise<CookieConsentSettingItem> {
  const now = new Date().toISOString();
  const db = getDb();

  const updates: Partial<NewCookieConsentSettingRecord> = {
    updatedAt: now,
  };
  if (input.isEnabled !== undefined) updates.isEnabled = input.isEnabled;
  if (input.bannerTitle !== undefined) updates.bannerTitle = input.bannerTitle.trim();
  if (input.bannerMessage !== undefined) updates.bannerMessage = input.bannerMessage.trim();
  if (input.acceptText !== undefined) updates.acceptText = input.acceptText.trim();
  if (input.rejectText !== undefined) updates.rejectText = input.rejectText.trim();
  if (input.customizeText !== undefined) updates.customizeText = input.customizeText.trim();
  if (input.position !== undefined) updates.position = input.position.trim().toLowerCase();
  if (input.theme !== undefined) updates.theme = input.theme.trim().toLowerCase();
  if (input.analyticsEnabled !== undefined) updates.analyticsEnabled = input.analyticsEnabled;
  if (input.marketingEnabled !== undefined) updates.marketingEnabled = input.marketingEnabled;
  if (input.functionalEnabled !== undefined) updates.functionalEnabled = input.functionalEnabled;
  if (input.cookiePolicyContent !== undefined) updates.cookiePolicyContent = input.cookiePolicyContent;

  if (db) {
    try {
      const current = await getCookieConsentSettings();
      await db
        .update(cookieConsentSettings)
        .set(updates)
        .where(eq(cookieConsentSettings.id, current.id));

      invalidateCookieSettingsCache();
      triggerCrossWorkerInvalidation();
      return await getCookieConsentSettings();
    } catch (error) {
      // Memory fallback
    }
  }

  // In-memory fallback
  Object.assign(memoryCookieSettings, updates);
  invalidateCookieSettingsCache();
  triggerCrossWorkerInvalidation();
  return { ...memoryCookieSettings };
}

/**
 * In-memory consent audit logs for compliance tracking
 */
export interface CookieConsentLogPayload {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: string;
  version?: string;
  ip?: string | null;
  userAgent?: string | null;
}

export const memoryConsentLogs: CookieConsentLogPayload[] = [];

export async function logCookieConsent(payload: CookieConsentLogPayload): Promise<boolean> {
  memoryConsentLogs.push({
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
  });
  if (memoryConsentLogs.length > 500) {
    memoryConsentLogs.shift();
  }
  return true;
}

export function getCookieConsentStats(): CookieConsentStats {
  const totalLogged = memoryConsentLogs.length;
  const analyticsAccepted = memoryConsentLogs.filter((l) => l.analytics).length;
  const marketingAccepted = memoryConsentLogs.filter((l) => l.marketing).length;
  const functionalAccepted = memoryConsentLogs.filter((l) => l.functional).length;

  return {
    totalLogged,
    analyticsAccepted,
    marketingAccepted,
    functionalAccepted,
    lastUpdated: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Client-Side Consent Utilities (localStorage + cookie, ZERO DB hits per view)
// ---------------------------------------------------------------------------

export function getStoredCookieConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (_e) {}

  // Fallback to cookie
  try {
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${COOKIE_CONSENT_NAME}=([^;]+)`));
    if (match) {
      return JSON.parse(decodeURIComponent(match[2]));
    }
  } catch (_e) {}

  return null;
}

export function saveCookieConsent(
  consent: Omit<CookieConsentState, "timestamp">,
  expiryDays = 365
): CookieConsentState {
  const fullConsent: CookieConsentState = {
    ...consent,
    timestamp: new Date().toISOString(),
    version: "v1",
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(fullConsent));
    } catch (_e) {}

    try {
      const maxAge = expiryDays * 24 * 60 * 60;
      document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(
        JSON.stringify(fullConsent)
      )}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } catch (_e) {}

    // Dispatch global event for listeners (like ScriptBlocker)
    window.dispatchEvent(
      new CustomEvent("cookie_consent_updated", { detail: fullConsent })
    );

    // Asynchronously log to server non-blockingly
    try {
      fetch("/api/cookie-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullConsent),
      }).catch(() => {});
    } catch (_e) {}
  }

  return fullConsent;
}
