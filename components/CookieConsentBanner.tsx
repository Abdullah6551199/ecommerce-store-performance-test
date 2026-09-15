"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CookieCustomizeModal from "@/components/CookieCustomizeModal";
import {
  getStoredCookieConsent,
  saveCookieConsent,
  type CookieConsentState,
} from "@/lib/script-blocker";
import type { CookieConsentSettingRecord } from "@/lib/db";

export default function CookieConsentBanner(): React.JSX.Element | null {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<CookieConsentSettingRecord | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  useEffect(() => {
    // 1. Check client-side stored consent
    const stored = getStoredCookieConsent();
    setHasConsent(Boolean(stored));

    // 2. Fetch remote or memory cookie consent settings
    fetch("/api/cookie-settings")
      .then((res) => res.json() as Promise<any>)
      .then((json) => {
        if (json.success && json.data) {
          setSettings(json.data);
        }
      })
      .catch((err) => console.warn("Failed to fetch cookie settings:", err));
  }, []);

  // Listen for custom trigger to open preferences (e.g. from footer or policy page)
  useEffect(() => {
    const handleOpenModal = () => setCustomizeOpen(true);
    window.addEventListener("apex_open_cookie_preferences", handleOpenModal);
    return () => window.removeEventListener("apex_open_cookie_preferences", handleOpenModal);
  }, []);

  if (hasConsent === null) {
    // Avoid hydration mismatch
    return null;
  }

  // If already consented and modal not opened, keep banner hidden
  if (hasConsent && !customizeOpen) {
    return (
      <CookieCustomizeModal
        isOpen={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        analyticsEnabled={settings?.analyticsEnabled ?? true}
        marketingEnabled={settings?.marketingEnabled ?? true}
        functionalEnabled={settings?.functionalEnabled ?? true}
        onSaved={(_consent: CookieConsentState) => {
          setHasConsent(true);
          setCustomizeOpen(false);
        }}
      />
    );
  }

  // If disabled by admin, don't show
  if (settings && !settings.isEnabled && !customizeOpen) {
    return null;
  }

  const handleAcceptAll = () => {
    saveCookieConsent({
      analytics: true,
      marketing: true,
      functional: true,
    });
    setHasConsent(true);
  };

  const handleRejectAll = () => {
    saveCookieConsent({
      analytics: false,
      marketing: false,
      functional: false,
    });
    setHasConsent(true);
  };

  const isTop = settings?.position === "top";
  const isDarkTheme = settings?.theme === "dark";

  return (
    <>
      {!hasConsent && (
        <aside
          aria-label="Cookie Consent"
          className={`fixed ${
            isTop ? "top-4" : "bottom-4"
          } left-4 right-4 z-50 mx-auto max-w-4xl animate-in slide-in-from-bottom-5 duration-300`}
        >
          <div
            className={`rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all ${
              isDarkTheme
                ? "border-purple-800 bg-[#2D024A] text-white shadow-purple-950/50"
                : "border-purple-200 bg-white/95 dark:bg-[#3C0561]/95 text-[#3C0561] dark:text-white backdrop-blur-md shadow-purple-900/15"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              {/* Message Content */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍪</span>
                  <h3 className="text-base font-extrabold tracking-tight">
                    {settings?.bannerTitle || "We use cookies"}
                  </h3>
                </div>
                <p className="text-xs text-[#5A0891]/80 dark:text-[#EACFFC]/80 leading-relaxed">
                  {settings?.bannerMessage ||
                    "We use cookies to improve your experience, analyze traffic, and personalize content."}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-[#960DF2] dark:text-[#EACFFC]">
                  <Link
                    href="/cookie-policy"
                    className="underline hover:text-[#AB3DF5] transition-colors"
                  >
                    Read our Cookie Policy
                  </Link>
                  <span>•</span>
                  <Link
                    href="/privacy-policy"
                    className="underline hover:text-[#AB3DF5] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  id="cookie-btn-accept"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#AB3DF5] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer active:scale-95"
                >
                  {settings?.acceptText || "Accept All"}
                </button>
                <button
                  type="button"
                  id="cookie-btn-reject"
                  onClick={handleRejectAll}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/40 text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] transition-all cursor-pointer active:scale-95"
                >
                  {settings?.rejectText || "Reject All"}
                </button>
                <button
                  type="button"
                  id="cookie-btn-customize"
                  onClick={() => setCustomizeOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-dashed border-purple-300 dark:border-purple-600 hover:border-purple-500 text-xs font-bold text-[#960DF2] dark:text-[#EACFFC] transition-all cursor-pointer"
                >
                  {settings?.customizeText || "Customize"}
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Granular Preference Customization Modal */}
      <CookieCustomizeModal
        isOpen={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        analyticsEnabled={settings?.analyticsEnabled ?? true}
        marketingEnabled={settings?.marketingEnabled ?? true}
        functionalEnabled={settings?.functionalEnabled ?? true}
        onSaved={(_consent: CookieConsentState) => {
          setHasConsent(true);
          setCustomizeOpen(false);
        }}
      />
    </>
  );
}
