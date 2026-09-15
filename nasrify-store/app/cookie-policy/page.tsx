import React from "react";
import Link from "next/link";
import { getCookieConsentSettings, getDefaultCookiePolicyContent } from "@/lib/cookie-consent";
import OpenCookiePreferencesButton from "./OpenCookiePreferencesButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cookie Policy | ApexStore",
  description: "Learn how ApexStore uses cookies and manage your GDPR data privacy preferences.",
};

export default async function CookiePolicyPage(): Promise<React.JSX.Element> {
  const settings = await getCookieConsentSettings();
  const policyContent = settings.cookiePolicyContent || getDefaultCookiePolicyContent();

  return (
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 bg-purple-50/30 dark:bg-[#200236]/30 text-[#3C0561] dark:text-[#EACFFC]">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-purple-300/70">
          <Link href="/" className="hover:text-[#960DF2] dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#960DF2] dark:text-[#EACFFC] font-semibold">Cookie Policy</span>
        </nav>

        {/* Page Hero */}
        <div className="border-b border-purple-200/80 dark:border-purple-800/60 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/60 px-3 py-1 text-xs font-extrabold text-[#960DF2] dark:text-[#EACFFC]">
              <span>🛡️</span>
              <span>GDPR &amp; ePrivacy Compliant</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#3C0561] dark:text-white">
              Cookie Policy &amp; Tracking Consent
            </h1>
            <p className="text-xs text-[#5A0891]/80 dark:text-[#EACFFC]/80 max-w-xl">
              Understand our data telemetry practices, manage your preferences, and review our third-party script isolation policy.
            </p>
          </div>

          <div className="shrink-0">
            <OpenCookiePreferencesButton />
          </div>
        </div>

        {/* Content Container */}
        <div className="rounded-3xl border border-purple-100 dark:border-purple-800/80 bg-white dark:bg-[#3C0561]/25 p-6 sm:p-10 shadow-xl shadow-purple-500/5 space-y-8 text-xs sm:text-sm text-[#3C0561]/90 dark:text-[#EACFFC]/90 leading-relaxed">
          {/* Formatted Markdown/HTML Presentation */}
          <div className="prose prose-purple dark:prose-invert max-w-none space-y-6">
            {policyContent.split("\n\n").map((block, idx) => {
              const trimmed = block.trim();
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={idx} className="text-xl sm:text-2xl font-black text-[#3C0561] dark:text-white">
                    {trimmed.replace(/^#\s*/, "")}
                  </h2>
                );
              }
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-base sm:text-lg font-bold text-[#3C0561] dark:text-white pt-2">
                    {trimmed.replace(/^###\s*/, "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("|")) {
                // Render table
                const rows = trimmed.split("\n").filter((r) => !r.includes("---"));
                if (rows.length < 2) return null;
                const headers = rows[0].split("|").map((c) => c.trim()).filter(Boolean);
                const dataRows = rows.slice(1).map((r) => r.split("|").map((c) => c.trim()).filter(Boolean));

                return (
                  <div key={idx} className="overflow-x-auto rounded-2xl border border-purple-100 dark:border-purple-800 my-4">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-purple-50 dark:bg-purple-950/60 border-b border-purple-100 dark:border-purple-800 font-bold text-[#3C0561] dark:text-white">
                        <tr>
                          {headers.map((h, i) => (
                            <th key={i} className="p-3.5">
                              {h.replace(/\*\*/g, "")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-100/70 dark:divide-purple-800/40">
                        {dataRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-purple-50/40 dark:hover:bg-purple-900/20">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-3.5">
                                {cell.includes("**") ? (
                                  <strong className="text-[#960DF2] dark:text-[#EACFFC]">
                                    {cell.replace(/\*\*/g, "")}
                                  </strong>
                                ) : (
                                  cell
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              if (trimmed.startsWith("- ")) {
                const items = trimmed.split("\n").map((i) => i.replace(/^-\s*/, ""));
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1.5 text-xs text-[#5A0891]/90 dark:text-[#EACFFC]/90">
                    {items.map((it, iIdx) => (
                      <li key={iIdx}>{it}</li>
                    ))}
                  </ul>
                );
              }
              if (trimmed === "---") {
                return <hr key={idx} className="border-purple-100 dark:border-purple-800/60 my-4" />;
              }

              return (
                <p key={idx} className="text-xs sm:text-sm text-[#5A0891]/90 dark:text-[#EACFFC]/90 leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Bottom Action Card */}
          <div className="rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#3C0561] dark:text-white">
                Ready to review or adjust your preferences?
              </h4>
              <p className="text-xs text-[#5A0891]/80 dark:text-[#EACFFC]/80 mt-0.5">
                You can change your consent preferences for Analytics, Marketing, and Functional cookies at any time.
              </p>
            </div>
            <OpenCookiePreferencesButton />
          </div>
        </div>
      </div>
    </div>
  );
}
