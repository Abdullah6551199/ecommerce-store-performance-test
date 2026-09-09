import React from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminCustomersPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Customers</h1>
          <p className="mt-1 text-xs text-white/60">
            View customer profiles, purchase history, and registered accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-[#FEF500]">
            Stage 6 Module
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-white/15 bg-[#0c140f]/60 p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-[#FEF500]">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="mt-4 text-base font-semibold text-white">Customer Records</h3>
        <p className="mt-1 text-sm text-white/50 max-w-md mx-auto">
          Customer relationship management, order history, and account data will be managed here.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/admin/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
