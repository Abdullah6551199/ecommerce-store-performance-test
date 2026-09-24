"use client";

import React, { useState } from "react";
import Button from "@/components/themes/blocks/Button";

export default function ContactForm(): React.JSX.Element {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus(null);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || undefined,
          message: message.trim(),
        }),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message. Please try again.");
      }

      setStatus({
        type: "success",
        message: data.message || "Thank you! Your message has been sent successfully.",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-[family-name:var(--theme-font-body)]">
      {status && (
        <div
          className={`p-4 rounded-xl text-sm border ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-muted,#71717A)] mb-1.5">
            Your Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Mercer"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-[var(--theme-text,#18181B)] placeholder-[var(--theme-text-muted,#71717A)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary,#25D366)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-muted,#71717A)] mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-[var(--theme-text,#18181B)] placeholder-[var(--theme-text-muted,#71717A)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary,#25D366)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-muted,#71717A)] mb-1.5">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Order Inquiry, Sizing Advice, Partnership..."
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-[var(--theme-text,#18181B)] placeholder-[var(--theme-text-muted,#71717A)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary,#25D366)]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-muted,#71717A)] mb-1.5">
          Message <span className="text-rose-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can our customer support team assist you today?"
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-white text-[var(--theme-text,#18181B)] placeholder-[var(--theme-text-muted,#71717A)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary,#25D366)] resize-y"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending Message..." : "Send Message"}
      </Button>
    </form>
  );
}
