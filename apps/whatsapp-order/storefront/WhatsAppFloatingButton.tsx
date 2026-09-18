"use client";

import React, { useState, useEffect } from "react";
import { WhatsAppOrderSettings, DEFAULT_WHATSAPP_SETTINGS } from "../shared/types";
import { formatWhatsAppUrl, sanitizePhoneNumber } from "../lib/whatsapp";

/**
 * Floating WhatsApp chat button for storefront bottom-right corner.
 * Loaded dynamically on client side via storefront.floating extension point.
 */
export default function WhatsAppFloatingButton(): React.JSX.Element | null {
  const [settings, setSettings] = useState<WhatsAppOrderSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const res = await fetch("/api/apps/whatsapp-order/settings");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            if (isMounted) {
              setSettings({ ...DEFAULT_WHATSAPP_SETTINGS, ...json.data });
            }
          }
        }
      } catch (err) {
        // Silently catch to avoid disrupting storefront
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !settings) {
    return null;
  }

  const phone = sanitizePhoneNumber(settings.phoneNumber);
  if (!settings.enableFloating || !phone) {
    return null;
  }

  const waUrl = formatWhatsAppUrl(phone, settings.floatingMessage);

  return (
    <div className="relative group">
      {/* Tooltip */}
      <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap rounded-lg bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 text-xs font-semibold px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
        Chat with us
      </span>

      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        id="whatsapp-floating-btn"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl shadow-emerald-600/30 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        <svg
          className="h-7 w-7 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.301-.15-1.781-.879-2.056-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.953 1.181-.176.201-.351.226-.652.075s-1.27-.468-2.42-1.493c-.894-.799-1.498-1.786-1.674-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.1-.201.05-.376-.025-.527s-.677-1.632-.928-2.234c-.244-.587-.492-.507-.677-.516l-.578-.01c-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9-.12.58-.352 1.781-1.28 2.032-1.882.251-.602.251-1.118.176-1.229-.075-.11-.276-.176-.577-.326zM12.04 2C6.52 2 2.04 6.48 2.04 12c0 1.98.58 3.82 1.58 5.38L2 22l4.77-1.58C8.28 21.36 10.1 22 12.04 22c5.52 0 10-4.48 10-10S17.56 2 12.04 2zm0 18.2c-1.68 0-3.24-.52-4.54-1.41l-.33-.22-2.82.93.94-2.75-.24-.37c-.98-1.5-1.51-3.25-1.51-5.08 0-4.69 3.81-8.5 8.5-8.5s8.5 3.81 8.5 8.5c0 4.69-3.81 8.5-8.5 8.5z" />
        </svg>
      </a>
    </div>
  );
}
