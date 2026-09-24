"use client";

import React, { useState, useEffect } from "react";
import { GenerationHistory } from "./GenerationHistory";
import { AIGeneratorPanel } from "./AIGeneratorPanel";

export default function AIReviewGeneratorManager() {
  const [activeTab, setActiveTab] = useState<"history" | "generate" | "settings">("history");
  const [productsList, setProductsList] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductTitle, setSelectedProductTitle] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/products?limit=50")
      .then((res) => res.json())
      .then((data: any) => {
        const prods = data.data?.products || data.products || [];
        setProductsList(prods);
        if (prods.length > 0) {
          setSelectedProductId(prods[0].id);
          setSelectedProductTitle(prods[0].name);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#25D366]/20 text-zinc-400 border border-[#25D366]/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            AI Review Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate authentic, tailored product reviews using Cloudflare Workers AI.
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "history"
                ? "bg-[#25D366] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Generation Batches
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "generate"
                ? "bg-[#25D366] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Generate New
          </button>
        </div>
      </div>

      {activeTab === "history" && <GenerationHistory />}

      {activeTab === "generate" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <label className="text-xs font-semibold text-slate-300 whitespace-nowrap">
              Target Product:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedProductId(id);
                const p = productsList.find((x) => x.id === id);
                if (p) setSelectedProductTitle(p.name);
              }}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 w-full max-w-md focus:outline-none focus:border-[#25D366]"
            >
              {productsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          {selectedProductId && (
            <AIGeneratorPanel
              productId={selectedProductId}
              productTitle={selectedProductTitle}
              onReviewsGenerated={() => setActiveTab("history")}
            />
          )}
        </div>
      )}
    </div>
  );
}
