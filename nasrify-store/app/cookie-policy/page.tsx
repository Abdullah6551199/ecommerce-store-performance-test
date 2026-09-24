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
    <div className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50/50 text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-body)]">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--theme-text-muted,#71717A)]">
          <Link href="/" className="hover:text-[var(--theme-primary,#25D366)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--theme-text,#18181B)] font-semibold">Cookie Policy</span>
        </nav>

        {/* Page Hero */}
        <div className="border-b border-[var(--theme-border,#E4E4E7)] pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--theme-primary-light,#DCFCE7)] px-3 py-1 text-xs font-bold text-[var(--theme-accent,#18181B)]">
              <span>🛡️</span>
              <span>GDPR &amp; ePrivacy Compliant</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
              Cookie Policy &amp; Tracking Consent
            </h1>
            <p className="text-xs text-[var(--theme-text-muted,#71717A)] max-w-xl">
              Understand our data telemetry practices, manage your preferences, and review our third-party script isolation policy.
            </p>
          </div>

          <div className="shrink-0">
            <OpenCookiePreferencesButton />
          </div>
        </div>

        {/* Content Container */}
        <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white p-6 sm:p-10 shadow-sm space-y-8 text-xs sm:text-sm text-[var(--theme-text,#18181B)] leading-relaxed">
          {/* Formatted Markdown/HTML Presentation */}
          <div className="prose max-w-none space-y-6">
            {policyContent.split("\n\n").map((block, idx) => {
              const trimmed = block.trim();
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={idx} className="text-xl sm:text-2xl font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
                    {trimmed.replace(/^#\s*/, "")}
                  </h2>
                );
              }
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-base sm:text-lg font-bold text-[var(--theme-text,#18181B)] pt-2 font-[family-name:var(--theme-font-heading)]">
                    {trimmed.replace(/^###\s*/, "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("|")) {
                const rows = trimmed.split("\n").filter((r) => !r.includes("---"));
                if (rows.length < 2) return null;
                const headers = rows[0].split("|").map((c) => c.trim()).filter(Boolean);
                const dataRows = rows.slice(1).map((r) => r.split("|").map((c) => c.trim()).filter(Boolean));

                return (
                  <div key={idx} className="overflow-x-auto rounded-xl border border-[var(--theme-border,#E4E4E7)] my-4">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 border-b border-[var(--theme-border,#E4E4E7)] font-bold text-[var(--theme-text,#18181B)]">
                        <tr>
                          {headers.map((h, i) => (
                            <th key={i} className="p-3.5">
                              {h.replace(/\*\*/g, "")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--theme-border,#E4E4E7)]">
                        {dataRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-zinc-50/50">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-3.5">
                                {cell.includes("**") ? (
                                  <strong className="text-[var(--theme-text,#18181B)]">
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
                  <ul key={idx} className="list-disc pl-5 space-y-1.5 text-xs text-[var(--theme-text,#18181B)]">
                    {items.map((it, iIdx) => (
                      <li key={iIdx}>{it}</li>
                    ))}
                  </ul>
                );
              }
              if (trimmed === "---") {
                return <hr key={idx} className="border-[var(--theme-border,#E4E4E7)] my-4" />;
              }

              return (
                <p key={idx} className="text-xs sm:text-sm text-[var(--theme-text,#18181B)] leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Bottom Action Card */}
          <div className="rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
                Ready to review or adjust your preferences?
              </h4>
              <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-0.5">
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
