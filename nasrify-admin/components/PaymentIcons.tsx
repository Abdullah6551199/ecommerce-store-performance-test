"use client";

import React, { useEffect, useState } from "react";
import type { PaymentIconRecord } from "@/lib/db";

interface PaymentIconsProps {
  className?: string;
  itemClassName?: string;
  initialIcons?: PaymentIconRecord[];
}

export function StandardPaymentSvg({ name }: { name: string }): React.JSX.Element {
  const norm = name.toLowerCase().replace(/[\s\-_]/g, "");

  if (norm.includes("visa")) {
    return (
      <svg className="h-5 w-auto" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#2563EB" />
        <path
          d="M14.5 16.5l2.2-10h2.6l-2.2 10h-2.6zm9.8-9.8c-.5-.2-1.3-.4-2.3-.4-2.5 0-4.3 1.3-4.3 3.2 0 1.4 1.3 2.2 2.2 2.7.9.4 1.3.8 1.3 1.2 0 .6-.8.9-1.5.9-.9 0-1.5-.2-2.3-.5l-.3-.2-.3 1.9c.5.2 1.5.4 2.5.4 2.7 0 4.4-1.3 4.4-3.3 0-1.1-.7-2-2.2-2.7-.9-.4-1.5-.7-1.5-1.2 0-.4.5-.8 1.5-.8.8 0 1.4.2 1.9.4l.2.1.3-1.6zm4.9 0h-2c-.6 0-1.1.2-1.3.8l-3.8 9h2.7l.5-1.5h3.3l.3 1.5h2.4l-2.1-9.8zm-2.8 6.3l1-2.9.6 2.9h-1.6zM11.7 6.7l-2.5 6.9-.3-1.4c-.5-1.6-2-3.4-3.7-4.3l2.4 8.6h2.7l4-9.8h-2.6z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (norm.includes("mastercard") || norm === "mc") {
    return (
      <svg className="h-5 w-auto" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#1F2937" />
        <circle cx="14" cy="12" r="7" fill="#EB001B" />
        <circle cx="22" cy="12" r="7" fill="#F79E1B" fillOpacity="0.85" />
      </svg>
    );
  }

  if (norm.includes("amex") || norm.includes("americanexpress")) {
    return (
      <svg className="h-5 w-auto" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#0284C7" />
        <text
          x="18"
          y="15"
          fill="#FFFFFF"
          fontSize="8"
          fontWeight="900"
          fontFamily="sans-serif"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          AMEX
        </text>
      </svg>
    );
  }

  if (norm.includes("paypal")) {
    return (
      <svg className="h-5 w-auto" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#003087" />
        <path
          d="M13 6h4.5c2 0 3.2 1 3 2.8-.3 2.1-1.8 3.2-3.6 3.2h-1.6l-.8 5H12l2-11h-1zm3.8 4.2h1.2c.9 0 1.6-.5 1.7-1.4.1-.9-.5-1.3-1.4-1.3h-1.1l-.4 2.7z"
          fill="#0079C1"
        />
        <path
          d="M16 8h4.5c2 0 3.2 1 3 2.8-.3 2.1-1.8 3.2-3.6 3.2h-1.6l-.8 5H15l2-11h-1zm3.8 4.2h1.2c.9 0 1.6-.5 1.7-1.4.1-.9-.5-1.3-1.4-1.3h-1.1l-.4 2.7z"
          fill="#00457C"
          fillOpacity="0.4"
        />
      </svg>
    );
  }

  if (norm.includes("applepay") || norm.includes("apple")) {
    return (
      <svg className="h-5 w-auto" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#000000" />
        <path
          d="M13.2 11.8c0-1.8 1.5-2.7 1.6-2.8-.9-1.2-2.2-1.4-2.7-1.4-1.1-.1-2.2.6-2.8.6-.6 0-1.5-.6-2.4-.6-1.2 0-2.4.7-3 1.8-1.3 2.3-.3 5.7 1 7.4.6.9 1.4 1.9 2.4 1.8 1-.1 1.3-.6 2.5-.6s1.5.6 2.5.6c1.1 0 1.7-.9 2.4-1.8.8-1.1 1.1-2.1 1.1-2.2-.1 0-2.1-.8-2.1-2.9zm-1.4-5.2c.5-.6.8-1.4.7-2.3-.8 0-1.7.5-2.2 1.1-.4.5-.8 1.4-.7 2.2.9.1 1.7-.4 2.2-1z"
          fill="#FFFFFF"
        />
        <text
          x="24"
          y="15"
          fill="#FFFFFF"
          fontSize="9"
          fontWeight="bold"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        >
          Pay
        </text>
      </svg>
    );
  }

  if (norm.includes("googlepay") || norm.includes("gpay")) {
    return (
      <svg className="h-5 w-auto" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#FFFFFF" stroke="#E5E7EB" />
        <path
          d="M14.5 12.2v-1.9h4.3c.1.3.1.6.1 1 0 1.2-.3 2.2-1 2.9-.8.8-1.9 1.2-3.4 1.2-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9c1.3 0 2.4.5 3.3 1.3l-1.3 1.3c-.6-.6-1.3-.9-2-.9-1.8 0-3.2 1.5-3.2 3.2s1.5 3.2 3.2 3.2c1.2 0 2-.5 2.4-1 .3-.4.5-.9.6-1.6h-2.9z"
          fill="#4285F4"
        />
        <text
          x="23"
          y="14.5"
          fill="#5F6368"
          fontSize="8"
          fontWeight="bold"
          fontFamily="Roboto, sans-serif"
        >
          Pay
        </text>
      </svg>
    );
  }

  // Generic fallback badge
  return (
    <div className="flex h-6 min-w-[36px] items-center justify-center rounded px-2 text-[10px] font-bold bg-white dark:bg-[#18181B] text-[#18181B] dark:text-[#DCFCE7] border border-[#E4E4E7] dark:border-zinc-700/60 shadow-xs">
      {name}
    </div>
  );
}

export default function PaymentIcons({
  className = "flex flex-wrap items-center gap-2",
  itemClassName = "inline-flex items-center justify-center transition-transform hover:scale-105",
  initialIcons,
}: PaymentIconsProps): React.JSX.Element {
  const [icons, setIcons] = useState<PaymentIconRecord[]>(initialIcons || []);

  useEffect(() => {
    if (!initialIcons || initialIcons.length === 0) {
      fetch("/api/payment-icons")
        .then((res) => res.json() as Promise<any>)
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setIcons(json.data);
          }
        })
        .catch((err) => console.warn("Failed to load payment icons:", err));
    }
  }, [initialIcons]);

  if (icons.length === 0) {
    // Default fallback badges
    return (
      <div className={className}>
        {["Visa", "Mastercard", "American Express", "PayPal", "Apple Pay", "Google Pay"].map(
          (name) => (
            <div key={name} className={itemClassName} title={name}>
              <StandardPaymentSvg name={name} />
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {icons.map((icon) => (
        <div key={icon.id} className={itemClassName} title={icon.name}>
          {icon.iconSvg && icon.iconSvg.trim().startsWith("<svg") ? (
            <div
              className="h-5 w-auto flex items-center justify-center [&>svg]:h-5 [&>svg]:w-auto"
              dangerouslySetInnerHTML={{ __html: icon.iconSvg }}
            />
          ) : (
            <StandardPaymentSvg name={icon.name} />
          )}
        </div>
      ))}
    </div>
  );
}
