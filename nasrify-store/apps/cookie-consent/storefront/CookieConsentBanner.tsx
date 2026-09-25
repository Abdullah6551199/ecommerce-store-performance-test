"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CookieCustomizeModal from "./CookieCustomizeModal";
import {
  getStoredCookieConsent,
  saveCookieConsent,
} from "../lib/cookie-consent";
import type {
  CookieConsentAppSettings,
  CookieConsentSettingItem,
  CookieConsentState,
} from "../shared/types";
import { DEFAULT_COOKIE_CONSENT_SETTINGS } from "../shared/types";

export default function CookieConsentBanner(): React.JSX.Element | null {
  const [hasConsent, setHasConsent] = useState(true); // Default true until verified in client to avoid hydration flash
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState<CookieConsentAppSettings>(DEFAULT_COOKIE_CONSENT_SETTINGS);
  const [content, setContent] = useState<Partial<CookieConsentSettingItem>>({});

  useEffect(() => {
    // 1. Check if user already consented
    const stored = getStoredCookieConsent();
    if (!stored) {
      setHasConsent(false);
    }

    // 2. Fetch live settings & content
    Promise.all([
      fetch("/api/apps/cookie-consent/settings")
        .then((res) => res.json() as Promise<any>)
        .catch(() => null),
      fetch("/api/cookie-settings")
        .then((res) => res.json() as Promise<any>)
        .catch(() => null),
    ]).then(([appSettingsRes, contentRes]) => {
      if (appSettingsRes?.success && appSettingsRes.data) {
        setSettings((prev) => ({ ...prev, ...appSettingsRes.data }));
      }
      if (contentRes?.success && contentRes.data) {
        setContent(contentRes.data);
      }
    });
  }, []);

  if (hasConsent || !settings.enabled) {
    return null;
  }

  const handleAcceptAll = () => {
    saveCookieConsent(
      {
        necessary: true,
        analytics: true,
        marketing: true,
        functional: true,
      },
      settings.consentExpiryDays
    );
    setHasConsent(true);
  };

  const handleRejectAll = () => {
    saveCookieConsent(
      {
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false,
      },
      settings.consentExpiryDays
    );
    setHasConsent(true);
  };

  const handleSavedPreferences = (_consent: CookieConsentState) => {
    setHasConsent(true);
    setShowModal(false);
  };

  const isTop = settings.bannerPosition === "top";
  const title = content.bannerTitle || "We use cookies";
  const message =
    content.bannerMessage ||
    "We use cookies to improve your experience, analyze traffic, and personalize content.";
  const acceptText = content.acceptText || "Accept All";
  const rejectText = content.rejectText || "Reject All";
  const customizeText = content.customizeText || "Customize";

  return (
    <>
      <div
        className={`fixed left-0 right-0 z-40 p-4 sm:p-6 transition-all duration-300 animate-in ${
          isTop ? "top-0 slide-in-from-top-4" : "bottom-0 slide-in-from-bottom-4"
        }`}
        data-app="cookie-consent"
      >
        <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-5 sm:p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            {/* Message */}
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍪</span>
                <h3 className="text-base font-black text-[#18181B] dark:text-white sm:text-lg">
                  {title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {message}{" "}
                <Link
                  href="/cookie-policy"
                  className="font-bold underline text-[#25D366] hover:opacity-80 transition-opacity"
                >
                  Read Cookie Policy
                </Link>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end">
              {settings.showCustomizeButton && (
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {customizeText}
                </button>
              )}
              <button
                type="button"
                onClick={handleRejectAll}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {rejectText}
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="rounded-xl bg-[#25D366] px-6 py-2.5 text-xs font-black text-white shadow-sm hover:bg-[#1EA855] transition-all hover:scale-102"
              >
                {acceptText}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showModal && (
        <CookieCustomizeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          analyticsEnabled={settings.analyticsCategory}
          marketingEnabled={settings.marketingCategory}
          functionalEnabled={settings.functionalCategory}
          onSaved={handleSavedPreferences}
        />
      )}
    </>
  );
}
