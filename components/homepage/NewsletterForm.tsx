"use client";

import React, { useState } from "react";

interface NewsletterFormProps {
  placeholderText?: string;
  buttonText?: string;
}

export default function NewsletterForm({
  placeholderText = "Enter your email address...",
  buttonText = "Subscribe",
}: NewsletterFormProps): React.JSX.Element {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <div className="mt-6 p-3 rounded-xl bg-[#18C729]/10 border border-[#18C729]/30 text-xs font-semibold text-[#18C729] max-w-md mx-auto text-center">
        ✓ Thank you for subscribing to Apex VIP releases!
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
    >
      <input
        type="email"
        required
        placeholder={placeholderText}
        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-xs text-white placeholder-white/40 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
        style={{ borderRadius: "var(--radius-btn, 0.75rem)" }}
      />
      <button
        type="submit"
        className="w-full sm:w-auto shrink-0 px-6 py-3 text-xs font-bold text-black hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
        style={{
          borderRadius: "var(--radius-btn, 0.75rem)",
          background: "linear-gradient(135deg, var(--color-primary, #18C729), var(--color-secondary, #12a822))",
        }}
      >
        {buttonText}
      </button>
    </form>
  );
}
