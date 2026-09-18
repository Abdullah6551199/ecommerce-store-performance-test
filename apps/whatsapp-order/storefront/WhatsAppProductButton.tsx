"use client";

import React, { useState, useEffect } from "react";
import { WhatsAppOrderSettings, DEFAULT_WHATSAPP_SETTINGS } from "../shared/types";
import {
  formatWhatsAppUrl,
  sanitizePhoneNumber,
  interpolateProductMessage,
} from "../lib/whatsapp";

interface Props {
  productId: string;
  productSlug?: string;
}

/**
 * "Order on WhatsApp" button for single product pages.
 * Renders via storefront.product.below extension point.
 */
export default function WhatsAppProductButton({
  productId,
  productSlug,
}: Props): React.JSX.Element | null {
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
  if (!settings.enableProductButton || !phone) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Dynamically retrieve the current product title and price from page context if available
    let productName = "";
    let productPrice = "";

    if (typeof document !== "undefined") {
      const h1 = document.querySelector("h1");
      if (h1 && h1.textContent) {
        productName = h1.textContent.trim();
      }

      // Check common price selectors in storefront
      const priceElem =
        document.querySelector("[data-product-price]") ||
        document.querySelector(".product-price") ||
        document.querySelector("[class*='text-2xl'][class*='font-bold']");
      if (priceElem && priceElem.textContent) {
        productPrice = priceElem.textContent.trim();
      }
    }

    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";

    const message = interpolateProductMessage(settings.productMessage, {
      name: productName || "Product",
      price: productPrice,
      url: currentUrl,
    });

    const targetUrl = formatWhatsAppUrl(phone, message);
    e.currentTarget.href = targetUrl;
  };

  const initialUrl = formatWhatsAppUrl(
    phone,
    interpolateProductMessage(settings.productMessage, {
      name: "Product",
      url: typeof window !== "undefined" ? window.location.href : "",
    })
  );

  return (
    <div className="w-full pt-2">
      <a
        href={initialUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        id="whatsapp-product-order-btn"
        className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-6 font-bold text-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        <svg
          className="h-5 w-5 fill-current shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.301-.15-1.781-.879-2.056-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.953 1.181-.176.201-.351.226-.652.075s-1.27-.468-2.42-1.493c-.894-.799-1.498-1.786-1.674-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.1-.201.05-.376-.025-.527s-.677-1.632-.928-2.234c-.244-.587-.492-.507-.677-.516l-.578-.01c-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9-.12.58-.352 1.781-1.28 2.032-1.882.251-.602.251-1.118.176-1.229-.075-.11-.276-.176-.577-.326zM12.04 2C6.52 2 2.04 6.48 2.04 12c0 1.98.58 3.82 1.58 5.38L2 22l4.77-1.58C8.28 21.36 10.1 22 12.04 22c5.52 0 10-4.48 10-10S17.56 2 12.04 2zm0 18.2c-1.68 0-3.24-.52-4.54-1.41l-.33-.22-2.82.93.94-2.75-.24-.37c-.98-1.5-1.51-3.25-1.51-5.08 0-4.69 3.81-8.5 8.5-8.5s8.5 3.81 8.5 8.5c0 4.69-3.81 8.5-8.5 8.5z" />
        </svg>
        <span>{settings.buttonText || "Order on WhatsApp"}</span>
      </a>
    </div>
  );
}
