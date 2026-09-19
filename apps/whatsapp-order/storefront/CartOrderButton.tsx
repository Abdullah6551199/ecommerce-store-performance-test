"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "@/components/CartContext";
import { WhatsAppOrderSettings, DEFAULT_WHATSAPP_SETTINGS } from "../shared/types";
import {
  formatWhatsAppUrl,
  sanitizePhoneNumber,
  buildCartMessage,
  CartMessageItem,
  WhatsAppCustomerInfo,
} from "../lib/whatsapp";

/**
 * "Order on WhatsApp" button for the Cart page.
 * Appears directly below the "Proceed to Checkout" button.
 * Stage 29.6: Persists order to D1 with source="whatsapp" before opening wa.me link.
 */
export default function CartOrderButton(): React.JSX.Element | null {
  const { items, subtotal, total } = useCart();
  const [settings, setSettings] = useState<WhatsAppOrderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sub-5s cache reflection: fetch with timestamp and re-fetch on tab focus/visibility
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch(`/api/apps/whatsapp-order/settings?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = (await res.json()) as any;
        if (json && json.success && json.data) {
          setSettings({ ...DEFAULT_WHATSAPP_SETTINGS, ...json.data });
        }
      }
    } catch {
      // Silent fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();

    const handleFocus = () => loadSettings();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadSettings();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadSettings]);

  if (loading || !settings) {
    return null;
  }

  const phone = sanitizePhoneNumber(settings.phoneNumber);
  if (!phone) {
    return null;
  }

  // If cart is empty, do not show button
  if (!items || items.length === 0) {
    return null;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const handleOrderOnWhatsApp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Retrieve customer details from localStorage or standard defaults
      let customerDetails: WhatsAppCustomerInfo = {
        name: "Customer Name",
        phone: "+92 300 1234567",
        email: "customer@example.com",
        address: "House 123, Street 4",
        city: "Karachi",
        postalCode: "75500",
        notes: "Please call before delivery",
      };

      try {
        const raw = localStorage.getItem("whatsapp_customer_info");
        if (raw) {
          const parsed = JSON.parse(raw);
          customerDetails = {
            name: parsed.name || customerDetails.name,
            phone: parsed.phone || customerDetails.phone,
            email: parsed.email || customerDetails.email,
            address: parsed.address || customerDetails.address,
            city: parsed.city || customerDetails.city,
            postalCode: parsed.postalCode || customerDetails.postalCode,
            notes: parsed.notes || customerDetails.notes,
          };
        } else {
          // Initialize in localStorage so customer details stay consistent
          localStorage.setItem("whatsapp_customer_info", JSON.stringify(customerDetails));
        }
      } catch {}

      const cartItemsForPayload = items.map((item: any) => {
        const itemName = item.productName || item.name || "Product";
        const itemPrice =
          item.unitPrice !== undefined
            ? item.unitPrice
            : item.salePrice !== null && item.salePrice !== undefined && item.salePrice > 0
            ? item.salePrice
            : item.price || 0;
        const itemLineTotal = item.lineTotal || itemPrice * (item.quantity || 1);
        return {
          product_id: item.productId || item.id || "product",
          name: itemName,
          qty: item.quantity || 1,
          price: itemPrice,
          line_total: itemLineTotal,
          variant_id: item.variantId || null,
          variant_name: item.variantName || null,
        };
      });

      const cartItemsForMessage: CartMessageItem[] = items.map((item: any) => {
        const itemName = item.productName || item.name || "Product";
        const itemPrice =
          item.unitPrice !== undefined
            ? item.unitPrice
            : item.salePrice !== null && item.salePrice !== undefined && item.salePrice > 0
            ? item.salePrice
            : item.price || 0;
        const itemSlug = item.productSlug || item.slug || "";
        const itemLineTotal = item.lineTotal || itemPrice * (item.quantity || 1);
        return {
          name: itemName,
          price: itemPrice,
          quantity: item.quantity || 1,
          lineTotal: itemLineTotal,
          url: itemSlug ? `${origin}/product/${itemSlug}` : "",
          imageUrl: item.imageUrl && item.imageUrl.startsWith("http") ? item.imageUrl : null,
        };
      });

      let orderRef = "";

      // Step 1: Save order to D1 before opening WhatsApp
      try {
        const saveRes = await fetch("/api/whatsapp-order/save-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cartItemsForPayload,
            customer: {
              name: customerDetails.name,
              phone: customerDetails.phone,
              email: customerDetails.email || null,
              address: customerDetails.address,
              city: customerDetails.city,
              postal_code: customerDetails.postalCode || null,
              notes: customerDetails.notes || null,
            },
            subtotal: subtotal || 0,
            shipping: 0,
            total: total || subtotal || 0,
            source: "whatsapp",
          }),
        });

        if (saveRes.ok) {
          const saveJson = (await saveRes.json()) as any;
          if (saveJson.success) {
            orderRef = saveJson.orderRef || saveJson.shortId || `#WA-${saveJson.orderId.slice(0, 6).toUpperCase()}`;
          }
        }
      } catch {
        // Step 5: Graceful fallback — if save fails, still open wa.me
      }

      // Step 4: Build message and open wa.me link
      const message = buildCartMessage(
        cartItemsForMessage,
        {
          subtotal: subtotal || 0,
          total: total || subtotal || 0,
        },
        {
          customer: customerDetails,
          orderRef: orderRef || undefined,
        }
      );

      const targetUrl = formatWhatsAppUrl(phone, message);
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-app="whatsapp-order" className="w-full mt-3">
      <button
        type="button"
        onClick={handleOrderOnWhatsApp}
        disabled={isSubmitting}
        id="whatsapp-cart-order-btn"
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-75"
      >
        <svg
          className="h-5 w-5 fill-current shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.301-.15-1.781-.879-2.056-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.953 1.181-.176.201-.351.226-.652.075s-1.27-.468-2.42-1.493c-.894-.799-1.498-1.786-1.674-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.1-.201.05-.376-.025-.527s-.677-1.632-.928-2.234c-.244-.587-.492-.507-.677-.516l-.578-.01c-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9-.12.58-.352 1.781-1.28 2.032-1.882.251-.602.251-1.118.176-1.229-.075-.11-.276-.176-.577-.326zM12.04 2C6.52 2 2.04 6.48 2.04 12c0 1.98.58 3.82 1.58 5.38L2 22l4.77-1.58C8.28 21.36 10.1 22 12.04 22c5.52 0 10-4.48 10-10S17.56 2 12.04 2zm0 18.2c-1.68 0-3.24-.52-4.54-1.41l-.33-.22-2.82.93.94-2.75-.24-.37c-.98-1.5-1.51-3.25-1.51-5.08 0-4.69 3.81-8.5 8.5-8.5s8.5 3.81 8.5 8.5c0 4.69-3.81 8.5-8.5 8.5z" />
        </svg>
        <span>{isSubmitting ? "Connecting to WhatsApp..." : "Order on WhatsApp"}</span>
      </button>
    </div>
  );
}
