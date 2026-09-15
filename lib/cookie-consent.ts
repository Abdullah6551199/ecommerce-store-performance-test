import { eq } from "drizzle-orm";
import {
  getDb,
  cookieConsentSettings,
  type CookieConsentSettingRecord,
  type NewCookieConsentSettingRecord,
} from "./db";

export interface UpdateCookieConsentSettingsInput {
  isEnabled?: boolean;
  bannerTitle?: string;
  bannerMessage?: string;
  acceptText?: string;
  rejectText?: string;
  customizeText?: string;
  position?: "bottom" | "top" | string;
  theme?: "light" | "dark" | string;
  analyticsEnabled?: boolean;
  marketingEnabled?: boolean;
  functionalEnabled?: boolean;
  cookiePolicyContent?: string | null;
}

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

export function getDefaultCookiePolicyContent(): string {
  return `
# Cookie Policy

**Last Updated:** September 14, 2026

Welcome to ApexStore. This Cookie Policy explains how we use cookies and similar tracking technologies when you visit our website, and how you can manage your preferences in compliance with the General Data Protection Regulation (GDPR) and the ePrivacy Directive.

---

### 1. What Are Cookies?
Cookies are small text files that are stored on your device (computer, smartphone, or tablet) when you browse websites. They are widely used to make websites work efficiently, enhance your user experience, remember your preferences, and provide analytical reporting to website owners.

---

### 2. How We Use Cookies
ApexStore uses cookies for several vital purposes:
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
- **Email:** privacy@apexstore.com
- **Support:** support@apexstore.com
- **Website:** [ApexStore Contact Page](/contact)
`.trim();
}

export const memoryCookieSettings: CookieConsentSettingRecord = {
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
  theme: "light",
  analyticsEnabled: true,
  marketingEnabled: true,
  functionalEnabled: true,
  cookiePolicyContent: getDefaultCookiePolicyContent(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Fetch cookie consent settings from D1 or fallback memory
 */
export async function getCookieConsentSettings(): Promise<CookieConsentSettingRecord> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(cookieConsentSettings).limit(1);
      if (rows.length > 0) {
        const row = rows[0];
        if (!row.cookiePolicyContent) {
          row.cookiePolicyContent = getDefaultCookiePolicyContent();
        }
        return row;
      }
    } catch (error) {
      console.warn("D1 query error in getCookieConsentSettings:", error);
    }
  }

  return { ...memoryCookieSettings };
}

/**
 * Update cookie consent settings
 */
export async function updateCookieConsentSettings(
  input: UpdateCookieConsentSettingsInput
): Promise<CookieConsentSettingRecord> {
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
      return await getCookieConsentSettings();
    } catch (error) {
      console.warn("D1 update error in updateCookieConsentSettings:", error);
    }
  }

  // In-memory fallback
  Object.assign(memoryCookieSettings, updates);
  return { ...memoryCookieSettings };
}

/**
 * In-memory consent audit logs for compliance tracking
 */
export const memoryConsentLogs: CookieConsentLogPayload[] = [];

export async function logCookieConsent(payload: CookieConsentLogPayload): Promise<boolean> {
  memoryConsentLogs.push({
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
  });
  // Limit memory logs to 500 records
  if (memoryConsentLogs.length > 500) {
    memoryConsentLogs.shift();
  }
  return true;
}
