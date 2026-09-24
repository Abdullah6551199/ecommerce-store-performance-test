"use client";

import React, { useState, useEffect } from "react";

function Toggle({
  checked,
  disabled = false,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-hidden ${
        checked ? "bg-[#960DF2]" : "bg-gray-300 dark:bg-gray-700"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
import {
  getStoredCookieConsent,
  saveCookieConsent,
} from "../lib/cookie-consent";
import type { CookieConsentState } from "../shared/types";

interface CookieCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsEnabled?: boolean;
  marketingEnabled?: boolean;
  functionalEnabled?: boolean;
  onSaved?: (consent: CookieConsentState) => void;
}

export default function CookieCustomizeModal({
  isOpen,
  onClose,
  analyticsEnabled = true,
  marketingEnabled = true,
  functionalEnabled = true,
  onSaved,
}: CookieCustomizeModalProps): React.JSX.Element | null {
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredCookieConsent();
      if (stored) {
        setPreferences({
          analytics: stored.analytics ?? false,
          marketing: stored.marketing ?? false,
          functional: stored.functional ?? false,
        });
      } else {
        setPreferences({
          analytics: false,
          marketing: false,
          functional: false,
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const consent = saveCookieConsent({
      necessary: true,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
      functional: preferences.functional,
    });
    if (onSaved) onSaved(consent);
    onClose();
  };

  const handleAcceptAll = () => {
    const consent = saveCookieConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
    if (onSaved) onSaved(consent);
    onClose();
  };

  const handleRejectAll = () => {
    const consent = saveCookieConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
    if (onSaved) onSaved(consent);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-preferences-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-[#1a052e] p-6 shadow-2xl space-y-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="cookie-preferences-title"
              className="text-xl font-black text-[#3C0561] dark:text-white sm:text-2xl"
            >
              Cookie Preferences
            </h2>
            <p className="mt-1 text-xs text-[#5A0891]/80 dark:text-[#EACFFC]/70">
              Customize your privacy choices. Necessary cookies remain enabled to allow core
              functionality.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-950 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Categories */}
        <div className="space-y-4 divide-y divide-zinc-200 dark:divide-zinc-800 dark:divide-zinc-200 dark:divide-zinc-800">
          {/* Necessary (Locked) */}
          <div className="pt-2 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#3C0561] dark:text-white">
                  Strictly Necessary
                </span>
                <span className="rounded-md bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 text-[10px] font-bold text-[#960DF2] dark:text-[#EACFFC]">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-[#5A0891]/70 dark:text-[#EACFFC]/60">
                Required for core website operations, session safety, and cart checkout.
              </p>
            </div>
            <div className="pt-1">
              <Toggle checked={true} disabled={true} onChange={() => {}} />
            </div>
          </div>

          {/* Analytics */}
          {analyticsEnabled && (
            <div className="pt-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-[#3C0561] dark:text-white">
                  Analytics & Insights
                </span>
                <p className="text-xs text-[#5A0891]/70 dark:text-[#EACFFC]/60">
                  Allows anonymous tracking of visit traffic and popular pages to optimize loading
                  speed.
                </p>
              </div>
              <div className="pt-1">
                <Toggle
                  checked={preferences.analytics}
                  onChange={(val) => setPreferences({ ...preferences, analytics: val })}
                />
              </div>
            </div>
          )}

          {/* Marketing */}
          {marketingEnabled && (
            <div className="pt-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-[#3C0561] dark:text-white">
                  Marketing & Pixels
                </span>
                <p className="text-xs text-[#5A0891]/70 dark:text-[#EACFFC]/60">
                  Used by social advertising partners (Meta, TikTok) to present relevant offers.
                </p>
              </div>
              <div className="pt-1">
                <Toggle
                  checked={preferences.marketing}
                  onChange={(val) => setPreferences({ ...preferences, marketing: val })}
                />
              </div>
            </div>
          )}

          {/* Functional */}
          {functionalEnabled && (
            <div className="pt-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-[#3C0561] dark:text-white">
                  Functional & Preferences
                </span>
                <p className="text-xs text-[#5A0891]/70 dark:text-[#EACFFC]/60">
                  Remembers your currency selection, wishlist items, and display theme.
                </p>
              </div>
              <div className="pt-1">
                <Toggle
                  checked={preferences.functional}
                  onChange={(val) => setPreferences({ ...preferences, functional: val })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleRejectAll}
              className="w-full sm:w-auto rounded-xl border border-purple-200 dark:border-purple-800/80 px-4 py-2 text-xs font-bold text-[#5A0891] dark:text-[#EACFFC] hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
            >
              Reject Non-Essential
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="w-full sm:w-auto rounded-xl border border-purple-200 dark:border-purple-800/80 px-4 py-2 text-xs font-bold text-[#5A0891] dark:text-[#EACFFC] hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
            >
              Accept All
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto rounded-xl bg-[#960DF2] px-6 py-2 text-xs font-black text-white shadow-sm hover:bg-[#7907C7] transition-all hover:scale-102"
          >
            Save My Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
