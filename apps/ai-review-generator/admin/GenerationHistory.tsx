"use client";

import React, { useState, useEffect } from "react";
import type { AIGenerationRecord, AIStats } from "../shared/types";

export function GenerationHistory() {
  const [items, setItems] = useState<AIGenerationRecord[]>([]);
  const [stats, setStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/apps/ai-review-generator/history");
      const data = (await res.json()) as any;
      if (data.success) {
        setItems(data.data.items || []);
        setStats(data.data.stats || null);
      }
    } catch (err) {
      console.error("Failed to load generation history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm(`Are you sure you want to delete this batch (${batchId})? All generated reviews associated with it will be removed permanently.`)) {
      return;
    }

    try {
      setDeletingId(batchId);
      const res = await fetch("/api/admin/apps/ai-review-generator/delete-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId }),
      });
      const data = (await res.json()) as any;
      if (data.success) {
        setMessage(`Batch ${batchId} deleted.`);
        fetchHistory();
      } else {
        alert(data.error || "Failed to delete batch");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete batch");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
            <div className="text-xs text-slate-400 font-medium">Total AI Reviews Generated</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.totalGenerated}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
            <div className="text-xs text-slate-400 font-medium">Generated This Month</div>
            <div className="text-2xl font-bold text-zinc-400 mt-1">{stats.totalThisMonth}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
            <div className="text-xs text-slate-400 font-medium">Est. Cloudflare Neurons Used</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">~{stats.estimatedNeuronsUsed}</div>
          </div>
        </div>
      )}

      {message && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs">
          {message}
        </div>
      )}

      {/* Batches Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Generation Batches</h3>
          <button
            onClick={fetchHistory}
            className="text-xs text-zinc-400 hover:text-zinc-400 font-medium transition"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading history...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No generation batches recorded yet. Open a product edit modal to generate your first reviews.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Product ID</th>
                  <th className="py-3 px-4">Count</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Tone & Lang</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {items.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-zinc-400">{row.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{row.productId}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white font-semibold">
                        {row.generatedCount} / {row.requestedCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-amber-400">
                      {row.ratingMin}-{row.ratingMax}★
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {row.tone} • {row.language}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        row.approvalMode === "auto"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {row.approvalMode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteBatch(row.id)}
                        disabled={deletingId === row.id}
                        className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 rounded text-xs transition disabled:opacity-50"
                      >
                        {deletingId === row.id ? "Deleting..." : "Delete Batch"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
