"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const CookieCustomizeModal = dynamic(() => import("@/components/CookieCustomizeModal"), { ssr: false });
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
                ? "border-zinc-800 bg-[#2D024A] text-white shadow-[#25D366]/20"
                : "border-[#E4E4E7] bg-white/95 dark:bg-[#18181B]/95 text-[#18181B] dark:text-white backdrop-blur-md shadow-[#25D366]/20"
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
                <p className="text-xs text-[#15803D]/80 dark:text-[#DCFCE7]/80 leading-relaxed">
                  {settings?.bannerMessage ||
                    "We use cookies to improve your experience, analyze traffic, and personalize content."}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-[#25D366] dark:text-[#DCFCE7]">
                  <Link
                    href="/cookie-policy"
                    className="underline hover:text-[#1EA855] transition-colors"
                  >
                    Read our Cookie Policy
                  </Link>
                  <span>•</span>
                  <Link
                    href="/privacy-policy"
                    className="underline hover:text-[#1EA855] transition-colors"
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
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EA855] text-white text-xs font-bold shadow-md shadow-[#25D366]/20 transition-all cursor-pointer active:scale-95"
                >
                  {settings?.acceptText || "Accept All"}
                </button>
                <button
                  type="button"
                  id="cookie-btn-reject"
                  onClick={handleRejectAll}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-[#F4F4F5]/50 dark:bg-[#18181B]/30 hover:bg-[#DCFCE7] dark:hover:bg-[#15803D]/40 text-xs font-bold text-[#18181B] dark:text-[#DCFCE7] transition-all cursor-pointer active:scale-95"
                >
                  {settings?.rejectText || "Reject All"}
                </button>
                <button
                  type="button"
                  id="cookie-btn-customize"
                  onClick={() => setCustomizeOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-dashed border-[#E4E4E7] dark:border-[#1EA855] hover:border-[#25D366] text-xs font-bold text-[#25D366] dark:text-[#DCFCE7] transition-all cursor-pointer"
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
