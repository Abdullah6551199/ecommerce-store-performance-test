"use client";

import React, { useState, useEffect } from "react";
import {
  getStoredCookieConsent,
  saveCookieConsent,
  type CookieConsentState,
} from "@/lib/script-blocker";
import Toggle from "@/components/ui/Toggle";

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
      analytics: preferences.analytics,
      marketing: preferences.marketing,
      functional: preferences.functional,
    });
    if (onSaved) onSaved(consent);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-[#3C0561] p-6 shadow-2xl shadow-purple-900/20 text-[#3C0561] dark:text-white transition-all space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC] text-lg">
              🍪
            </div>
            <div>
              <h2 id="cookie-modal-title" className="text-lg font-black tracking-tight text-[#3C0561] dark:text-white">
                Cookie Preferences
              </h2>
              <p className="text-xs text-[#5A0891]/80 dark:text-[#EACFFC]/70">
                Manage your GDPR &amp; privacy preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {/* 1. Necessary Cookies (Always On) */}
          <div className="rounded-xl border border-purple-200/70 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30 p-4 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#3C0561] dark:text-white">
                  Necessary Cookies
                </span>
                <span className="rounded-full bg-purple-100 dark:bg-purple-800 px-2 py-0.5 text-[10px] font-extrabold text-[#960DF2] dark:text-[#EACFFC]">
                  Always Active
                </span>
              </div>
              <p className="text-[11px] text-[#5A0891]/80 dark:text-[#EACFFC]/70 leading-relaxed">
                Required for the website to function, including security, session checkout, and user accounts.
              </p>
            </div>
            <div className="pt-0.5 shrink-0">
              <Toggle
                size="sm"
                checked={true}
                disabled={true}
                onChange={() => {}}
                aria-label="Necessary Cookies (Always active)"
              />
            </div>
          </div>

          {/* 2. Analytics Cookies */}
          {analyticsEnabled && (
            <div className="rounded-xl border border-purple-100 dark:border-purple-800/50 bg-white dark:bg-purple-950/20 p-4 flex items-start justify-between gap-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#3C0561] dark:text-white">
                  Analytics Cookies
                </h3>
                <p className="text-[11px] text-[#5A0891]/80 dark:text-[#EACFFC]/70 leading-relaxed">
                  Help us understand how visitors use our store, measure page load speeds, and identify catalog improvements.
                </p>
              </div>
              <div className="pt-0.5 shrink-0">
                <Toggle
                  size="sm"
                  id="cookie-toggle-analytics"
                  checked={preferences.analytics}
                  onChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, analytics: checked }))
                  }
                  aria-label="Toggle Analytics Cookies"
                />
              </div>
            </div>
          )}

          {/* 3. Marketing Cookies */}
          {marketingEnabled && (
            <div className="rounded-xl border border-purple-100 dark:border-purple-800/50 bg-white dark:bg-purple-950/20 p-4 flex items-start justify-between gap-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#3C0561] dark:text-white">
                  Marketing Cookies
                </h3>
                <p className="text-[11px] text-[#5A0891]/80 dark:text-[#EACFFC]/70 leading-relaxed">
                  Used to deliver relevant advertisements and assess the reach of promotional campaigns across external networks.
                </p>
              </div>
              <div className="pt-0.5 shrink-0">
                <Toggle
                  size="sm"
                  id="cookie-toggle-marketing"
                  checked={preferences.marketing}
                  onChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, marketing: checked }))
                  }
                  aria-label="Toggle Marketing Cookies"
                />
              </div>
            </div>
          )}

          {/* 4. Functional Cookies */}
          {functionalEnabled && (
            <div className="rounded-xl border border-purple-100 dark:border-purple-800/50 bg-white dark:bg-purple-950/20 p-4 flex items-start justify-between gap-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#3C0561] dark:text-white">
                  Functional Cookies
                </h3>
                <p className="text-[11px] text-[#5A0891]/80 dark:text-[#EACFFC]/70 leading-relaxed">
                  Remember your preferences such as theme mode, currency selection, and recently viewed comparison items.
                </p>
              </div>
              <div className="pt-0.5 shrink-0">
                <Toggle
                  size="sm"
                  id="cookie-toggle-functional"
                  checked={preferences.functional}
                  onChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, functional: checked }))
                  }
                  aria-label="Toggle Functional Cookies"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-purple-100 dark:border-purple-800/60">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-700/60 text-xs font-bold text-[#3C0561] dark:text-[#EACFFC] hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#AB3DF5] text-white text-xs font-extrabold shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
