"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { FaqRecord } from "@/lib/db";

export default function FaqManager(): React.JSX.Element {
  const [faqsList, setFaqsList] = useState<FaqRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqRecord | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchFaqs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/faqs");
      const data = (await res.json()) as any;
      if (data.success && Array.isArray(data.data?.faqs)) {
        setFaqsList(data.data.faqs);
      }
    } catch (err) {
      console.error("Failed to load FAQs:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const openCreateModal = () => {
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
    setCategory("General");
    setSortOrder(faqsList.length * 10);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FaqRecord) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || "General");
    setSortOrder(faq.sortOrder || 0);
    setIsActive(Boolean(faq.isActive));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      alert("Question and Answer are required.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim() || "General",
        sortOrder: Number(sortOrder),
        isActive,
      };

      const url = editingFaq ? `/api/admin/faqs/${editingFaq.id}` : "/api/admin/faqs";
      const method = editingFaq ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save FAQ");
      }

      setFeedback({
        type: "success",
        message: editingFaq ? "FAQ updated successfully." : "FAQ created successfully.",
      });
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err: any) {
      alert(err.message || "Failed to save FAQ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (faq: FaqRecord) => {
    const confirmDelete = window.confirm(`Delete question: "${faq.question}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, { method: "DELETE" });
      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete FAQ");
      }
      setFeedback({ type: "success", message: "FAQ deleted." });
      fetchFaqs();
    } catch (err: any) {
      alert(err.message || "Failed to delete FAQ");
    }
  };

  // Move FAQ up/down
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqsList.length) return;

    const newItems = [...faqsList];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Assign new sort order
    const payload = newItems.map((item, idx) => ({
      id: item.id,
      sortOrder: idx * 10,
    }));

    setFaqsList(newItems);

    try {
      await fetch("/api/admin/faqs/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
    } catch (err) {
      console.error("Failed to reorder:", err);
      fetchFaqs();
    }
  };

  // Categories list
  const categories = Array.from(new Set(faqsList.map((f) => f.category || "General"))).filter(Boolean);

  // Filtered FAQs
  const filteredFaqs = faqsList.filter((f) => {
    const matchesSearch =
      search === "" ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions (FAQs)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage storefront FAQs, group them by category, and adjust sort order.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New FAQ
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-sm border flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* FAQs List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading FAQs...</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No FAQs found.</div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredFaqs.map((faq, index) => (
              <div
                key={faq.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                      {faq.category || "General"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        faq.isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {faq.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                    {faq.question}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Reorder Buttons */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
                      title="Move Up"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, "down")}
                      disabled={index === filteredFaqs.length - 1}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition border-l border-slate-200 dark:border-slate-700"
                      title="Move Down"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => openEditModal(faq)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(faq)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete FAQ"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit FAQ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingFaq ? "Edit FAQ" : "Add FAQ"}
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Question <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What is your return window?"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Shipping, Returns, Sizing"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Answer <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write the clear, concise answer..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
                />
                <span>Active (Show on Storefront)</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save FAQ"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
