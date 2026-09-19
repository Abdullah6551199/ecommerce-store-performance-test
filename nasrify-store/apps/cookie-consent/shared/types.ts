/**
 * Shared types for Cookie Consent App
 */

export interface CookieConsentAppSettings {
  enabled: boolean;
  bannerPosition: "bottom" | "top";
  theme: "light" | "dark" | "auto";
  showCustomizeButton: boolean;
  analyticsCategory: boolean;
  marketingCategory: boolean;
  functionalCategory: boolean;
  consentExpiryDays: number;
  blockScriptsUntilConsent: boolean;
}

export const DEFAULT_COOKIE_CONSENT_SETTINGS: CookieConsentAppSettings = {
  enabled: true,
  bannerPosition: "bottom",
  theme: "auto",
  showCustomizeButton: true,
  analyticsCategory: true,
  marketingCategory: true,
  functionalCategory: true,
  consentExpiryDays: 365,
  blockScriptsUntilConsent: true,
};

export interface CookieConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: string;
  version?: string;
}

export interface CookieConsentSettingItem {
  id: string;
  tenantId?: string | null;
  isEnabled: boolean;
  bannerTitle: string;
  bannerMessage: string;
  acceptText: string;
  rejectText: string;
  customizeText: string;
  position: "bottom" | "top" | string;
  theme: "light" | "dark" | "auto" | string;
  analyticsEnabled: boolean;
  marketingEnabled: boolean;
  functionalEnabled: boolean;
  cookiePolicyContent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCookieConsentInput {
  isEnabled?: boolean;
  bannerTitle?: string;
  bannerMessage?: string;
  acceptText?: string;
  rejectText?: string;
  customizeText?: string;
  position?: "bottom" | "top" | string;
  theme?: "light" | "dark" | "auto" | string;
  analyticsEnabled?: boolean;
  marketingEnabled?: boolean;
  functionalEnabled?: boolean;
  cookiePolicyContent?: string | null;
}

export interface CookieConsentStats {
  totalLogged: number;
  analyticsAccepted: number;
  marketingAccepted: number;
  functionalAccepted: number;
  lastUpdated: string;
}
