"use client";

import React, { useState, useEffect } from "react";
import type { DigitalDownload } from "../shared/types";
import { DownloadButton } from "./DownloadButton";
import Link from "next/link";

interface MyDownloadsPageProps {
  initialEmail?: string;
}

export function MyDownloadsPage({ initialEmail = "" }: MyDownloadsPageProps): React.JSX.Element {
  const [downloads, setDownloads] = useState<DigitalDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [activeEmail, setActiveEmail] = useState(initialEmail);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDownloads() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const url = activeEmail
          ? `/api/apps/digital-products/my-downloads?email=${encodeURIComponent(activeEmail)}`
          : "/api/apps/digital-products/my-downloads";

        const res = await fetch(url);
        const data: any = await res.json();
        if (data.success) {
          setDownloads(data.downloads || []);
        } else {
          setErrorMessage(data.error || "Unable to fetch downloads.");
          setDownloads([]);
        }
      } catch {
        setErrorMessage("Network error fetching downloads.");
      } finally {
        setLoading(false);
      }
    }

    fetchDownloads();
  }, [activeEmail]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setActiveEmail(emailInput.trim());
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">💾</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Digital Vault
              </span>
            </div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              My Digital Downloads
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Access and download your purchased software, ebooks, audio tracks, and digital files.
            </p>
          </div>

          {/* Email quick switcher / lookup */}
          <form onSubmit={handleLookup} className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Enter order email..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm"
            >
              Lookup
            </button>
          </form>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center justify-between">
          <span>{errorMessage}</span>
          <Link href="/account/login" className="underline font-bold">
            Sign In to Customer Account &rarr;
          </Link>
        </div>
      )}

      {/* Downloads List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-400">
          Loading your digital assets...
        </div>
      ) : downloads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900/40">
          <div className="text-3xl mb-2">📁</div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            No digital downloads found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-6 max-w-sm mx-auto">
            {activeEmail
              ? `No digital downloads associated with "${activeEmail}".`
              : "Sign in or enter the email used during checkout to retrieve your download links."}
          </p>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 inline-block shadow-sm"
          >
            Browse Storefront
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {downloads.map((dl) => {
            const isExpired = dl.expiresAt ? Date.now() > dl.expiresAt : false;
            const isLimitReached = dl.downloadedCount >= dl.maxDownloads;

            return (
              <div
                key={dl.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:border-purple-500/30 transition-all"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">
                      Order #{dl.orderId.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-zinc-400">&bull;</span>
                    <span className="text-xs text-zinc-500">
                      Purchased on {formatDate(dl.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {dl.productName || "Digital Asset"}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                    <span>📄</span>
                    <span className="font-bold truncate">{dl.fileName}</span>
                  </div>

                  {/* License Key Display (if enabled) */}
                  {dl.licenseKey && (
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 inline-flex items-center gap-2 text-xs">
                      <span className="text-purple-600 dark:text-purple-400 font-bold">
                        License Key:
                      </span>
                      <code className="font-mono font-black text-purple-700 dark:text-purple-300 select-all">
                        {dl.licenseKey}
                      </code>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 pt-1">
                    <span>
                      Downloads: {dl.downloadedCount} / {dl.maxDownloads} used
                    </span>
                    <span>&bull;</span>
                    <span>
                      Expires:{" "}
                      {dl.expiresAt ? (
                        <span className={isExpired ? "text-rose-500 font-bold" : ""}>
                          {formatDate(dl.expiresAt)}
                        </span>
                      ) : (
                        "No expiry"
                      )}
                    </span>
                  </div>
                </div>

                {/* Download Button Component */}
                <div className="flex flex-col sm:flex-row items-start md:items-center gap-3">
                  <DownloadButton
                    token={dl.downloadToken}
                    fileName={dl.fileName}
                    downloadedCount={dl.downloadedCount}
                    maxDownloads={dl.maxDownloads}
                    buttonText="Download Now"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyDownloadsPage;
