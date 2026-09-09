import React from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Orders & Fulfillment</h1>
          <p className="mt-1 text-xs text-white/60">
            Track customer checkouts, invoices, shipping statuses, and payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-[#18C729]">
            Stage 6 Module
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-white/15 bg-[#0c140f]/60 p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-[#18C729]">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="mt-4 text-base font-semibold text-white">Order Pipeline</h3>
        <p className="mt-1 text-sm text-white/50 max-w-md mx-auto">
          Order fulfillment, customer lookup, and payment integrations will be implemented in subsequent stages.
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
