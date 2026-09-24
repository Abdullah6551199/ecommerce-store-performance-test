"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";
import { fetchWithClientCache } from "@/lib/client-cache";

const ReviewsManager = dynamic(
  () => import("@/apps/reviews/admin/ReviewsManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Reviews Moderation..." /> }
);

export default function AdminReviewsPage(): React.JSX.Element {
  const [appState, setAppState] = useState<{ loading: boolean; installed: boolean; enabled: boolean }>({
    loading: true,
    installed: false,
    enabled: false,
  });

  useEffect(() => {
    document.title = "Reviews & Ratings Moderation - Admin Panel";

    const checkReviewsApp = async () => {
      try {
        const json = await fetchWithClientCache("/api/admin/apps", { ttlMs: 60000 });
        if (json.success && Array.isArray(json.data)) {
          const reviewsApp = json.data.find((a: any) => a.id === "reviews");
          setAppState({
            loading: false,
            installed: Boolean(reviewsApp && reviewsApp.installed),
            enabled: Boolean(reviewsApp && reviewsApp.enabled),
          });
          return;
        }
      } catch {
        // network fallback
      }
      setAppState({ loading: false, installed: false, enabled: false });
    };

    checkReviewsApp();
  }, []);

  if (appState.loading) {
    return <AdminLoadingSkeleton title="Verifying Reviews App Status..." />;
  }

  if (!appState.installed || !appState.enabled) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Reviews &amp; Ratings Moderation
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-white/60">
            Moderate customer product reviews, ratings, and questions.
          </p>
        </div>

        <div className="rounded-3xl border border-dashed border-[#E4E4E7] dark:border-zinc-800/60 bg-white dark:bg-[#0c140f] p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCFCE7] dark:bg-[#18181B]/40 text-[#25D366] dark:text-zinc-400">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>

          <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
            {!appState.installed ? "Reviews app is not installed" : "Reviews app is disabled"}
          </h3>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-white/60 max-w-md mx-auto">
            {!appState.installed
              ? "The Reviews & Ratings module has been converted into an installable app. Install it from the Apps manager to manage ratings and reviews."
              : "The Reviews & Ratings app is currently disabled. Enable it from the Apps manager to activate moderation and storefront display."}
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              href="/admin/apps"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EA855] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
            >
              <span>Go to /admin/apps</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminErrorBoundary moduleName="Reviews & Ratings Moderation">
      <ReviewsManager />
    </AdminErrorBoundary>
  );
}
