import React from "react";

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
          d="M13 7h5.5c2 0 3.5 1 3 3-.6 2.4-2.2 3.5-4.5 3.5h-1.8l-1.2 5.5H11.5L13 7z"
          fill="#0079C1"
        />
        <path
          d="M15.5 10h4.5c1.8 0 3.2.9 2.7 2.8-.5 2.1-2 3.2-4.2 3.2h-1.6l-1 4.5h-2.4l2-10.5z"
          fill="#00457C"
          opacity="0.6"
        />
      </svg>
    );
  }

  if (norm.includes("apple") || norm.includes("applepay")) {
    return (
      <svg className="h-5 w-auto" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#000000" />
        <path
          d="M13.2 11.2c0-1.4.9-2.3 2-2.3.1 0 .3 0 .4.1-.4-1.2-1.5-1.9-2.7-1.9-1.6 0-2.8 1.3-2.8 3.1 0 2.2 1.9 4.6 3.6 4.6.6 0 1.2-.3 1.7-.3.5 0 1 .3 1.7.3 1.2 0 2.1-.9 2.7-1.9-.8-.5-1.4-1.4-1.4-2.5 0-1.3.9-2.2 1.7-2.3-.6-1-1.6-1.5-2.7-1.5-.7 0-1.4.2-1.8.4-.5.2-.9.4-1.2.4-.3 0-.8-.2-1.3-.4-.6-.2-1.1-.3-1.7-.3zM14.7 6.4c.5-.7.8-1.5.7-2.4-.8 0-1.7.5-2.2 1.2-.5.6-.8 1.5-.7 2.3.9.1 1.7-.4 2.2-1.1z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (norm.includes("google") || norm.includes("gpay")) {
    return (
      <svg className="h-5 w-auto" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#FFFFFF" stroke="#E5E7EB" />
        <path
          d="M18.8 12.2c0-.3 0-.6-.1-.9h-4.7v1.8h2.7c-.1.6-.5 1.2-1.1 1.6v1.3h1.7c1-1 1.5-2.3 1.5-3.8z"
          fill="#4285F4"
        />
        <path
          d="M14 17c1.4 0 2.5-.5 3.3-1.3l-1.7-1.3c-.5.3-1 .5-1.6.5-1.3 0-2.3-.9-2.7-2h-1.7v1.3c.9 1.8 2.7 2.8 4.4 2.8z"
          fill="#34A853"
        />
        <path
          d="M11.3 12.9c-.1-.3-.2-.7-.2-1s.1-.7.2-1v-1.3H9.6c-.4.8-.6 1.5-.6 2.3s.2 1.5.6 2.3l1.7-1.3z"
          fill="#FBBC05"
        />
        <path
          d="M14 8.7c.8 0 1.5.3 2 .8l1.5-1.5C16.5 7.1 15.3 6.6 14 6.6c-1.8 0-3.5 1-4.4 2.8l1.7 1.3c.4-1.1 1.4-2 2.7-2z"
          fill="#EA4335"
        />
      </svg>
    );
  }

  return (
    <div className="flex h-6 w-9 items-center justify-center rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-700 dark:text-gray-300">
      {name.slice(0, 4).toUpperCase()}
    </div>
  );
}
