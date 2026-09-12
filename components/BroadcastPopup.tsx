"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface BroadcastData {
  id: string;
  title: string;
  message: string;
  imageUrl: string | null;
  linkUrl: string | null;
  buttonText: string | null;
  type: string;
  target: string;
  createdAt: string;
}

export default function BroadcastPopup(): React.JSX.Element | null {
  const [broadcast, setBroadcast] = useState<BroadcastData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const pathname = usePathname();

  // Do not display on admin pages
  const isAdminRoute = pathname?.startsWith("/admin");

  const fetchActiveBroadcast = useCallback(async () => {
    if (isAdminRoute) return;
    try {
      const res = await fetch("/api/broadcasts/active");
      if (!res.ok) return;

      const data = (await res.json()) as {
        success?: boolean;
        broadcast?: BroadcastData | null;
      };

      if (data.success && data.broadcast) {
        setBroadcast(data.broadcast);
        setIsOpen(true);

        // Record the view on server
        fetch(`/api/broadcasts/${data.broadcast.id}/view`, {
          method: "POST",
        }).catch(() => {});
      }
    } catch {
      // Non-intrusive background error handling
    }
  }, [isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) return;

    // Slight delay of 1.5 seconds after load for smooth UX
    const timer = setTimeout(() => {
      fetchActiveBroadcast();
    }, 1500);

    return () => clearTimeout(timer);
  }, [fetchActiveBroadcast, isAdminRoute]);

  const handleClose = async () => {
    if (!broadcast) return;

    if (dontShowAgain) {
      try {
        await fetch(`/api/broadcasts/${broadcast.id}/dismiss`, {
          method: "POST",
        });
      } catch {
        // Fallback dismissal in local storage
        try {
          localStorage.setItem(`broadcast_dismissed_${broadcast.id}`, "true");
        } catch {}
      }
    }

    setIsOpen(false);
  };

  const handleActionClick = async () => {
    if (!broadcast) return;

    // Track click
    try {
      fetch(`/api/broadcasts/${broadcast.id}/click`, { method: "POST" }).catch(() => {});
    } catch {}

    if (dontShowAgain) {
      try {
        await fetch(`/api/broadcasts/${broadcast.id}/dismiss`, {
          method: "POST",
        });
      } catch {}
    }

    setIsOpen(false);

    if (broadcast.linkUrl) {
      window.location.href = broadcast.linkUrl;
    }
  };

  if (isAdminRoute || !isOpen || !broadcast) {
    return null;
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "promotion":
        return {
          label: "Special Offer",
          bgColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          ),
        };
      case "warning":
        return {
          label: "Important Notice",
          bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      case "announcement":
        return {
          label: "Announcement",
          bgColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          ),
        };
      default:
        return {
          label: "Store Update",
          bgColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };

  const badge = getTypeBadge(broadcast.type);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-purple-500/30 shadow-2xl shadow-purple-500/15 transform transition-all animate-in zoom-in-95 duration-200">
        {/* Purple gradient top highlight */}
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-[#18C729]" />

        {/* Close "X" Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close notification"
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Broadcast Image Header (if provided) */}
        {broadcast.imageUrl && (
          <div className="relative w-full h-44 sm:h-48 bg-zinc-100 dark:bg-white/5 overflow-hidden">
            <img
              src={broadcast.imageUrl}
              alt={broadcast.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide broken image gracefully
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${badge.bgColor}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-snug">
              {broadcast.title}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
              {broadcast.message}
            </p>
          </div>

          {/* Action Button (if link/button provided) */}
          {(broadcast.buttonText || broadcast.linkUrl) && (
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 transition duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>{broadcast.buttonText || "Learn More"}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}

          {/* Dismissal Footer */}
          <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span className="group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition">
                Don&apos;t show again
              </span>
            </label>

            <button
              type="button"
              onClick={handleClose}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
