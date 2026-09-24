"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AnnouncementMessage {
  text: string;
  icon: "truck" | "refresh" | "tag";
  link?: string;
}

interface TopAnnouncementBarProps {
  customMessage?: string | null;
  phone?: string | null;
}

const DEFAULT_MESSAGES: AnnouncementMessage[] = [
  { text: "Free Shipping on Orders Over $50", icon: "truck", link: "/shop" },
  { text: "Easy 30-Day Returns", icon: "refresh", link: "/returns" },
  { text: "Extra 10% Off on App", icon: "tag", link: "/shop" },
];

export default function TopAnnouncementBar({
  customMessage,
  phone = "+1 (800) 555-0199",
}: TopAnnouncementBarProps): React.JSX.Element {
  const messages: AnnouncementMessage[] = customMessage
    ? [{ text: customMessage, icon: "tag", link: "/shop" }, ...DEFAULT_MESSAGES.slice(1)]
    : DEFAULT_MESSAGES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || messages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, messages.length]);

  const activeMsg = messages[currentIndex];

  const renderIcon = (icon: AnnouncementMessage["icon"]) => {
    switch (icon) {
      case "truck":
        return (
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        );
      case "refresh":
        return (
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case "tag":
      default:
        return (
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
    }
  };

  return (
    <div
      className="relative z-50 w-full bg-[#25D366] text-white py-2 px-4 text-xs font-medium transition-colors"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Store Announcements"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Left spacer for desktop symmetry */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-zinc-200">
          <span>✨ Welcome to our VIP Store</span>
        </div>

        {/* Center: Rotating Messages */}
        <div className="flex-1 flex justify-center items-center overflow-hidden">
          <div
            key={currentIndex}
            className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300 transition-all text-center justify-center cursor-pointer"
          >
            {renderIcon(activeMsg.icon)}
            {activeMsg.link ? (
              <Link href={activeMsg.link} className="hover:underline tracking-wide font-medium">
                {activeMsg.text}
              </Link>
            ) : (
              <span className="tracking-wide font-medium">{activeMsg.text}</span>
            )}
          </div>
        </div>

        {/* Right: Phone contact */}
        {phone && (
          <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-semibold text-zinc-200 hover:text-white transition-colors">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:underline">
              <span className="hidden sm:inline">Call us: </span>{phone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
