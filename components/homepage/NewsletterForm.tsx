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
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <div className="mt-4 p-3.5 rounded-xl bg-white/95 dark:bg-[#3C0561] border border-purple-300 dark:border-purple-700 text-xs font-bold text-[#780AC2] dark:text-[#EACFFC] max-w-md mx-auto text-center shadow-lg">
        ✓ Thank you! You are now subscribed to our VIP newsletter &amp; private launches.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholderText}
        className="w-full rounded-lg border border-purple-200 dark:border-purple-700 bg-white px-4 py-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-[#960DF2] focus:outline-none focus:ring-2 focus:ring-[#960DF2]/30 shadow-sm"
      />
      <button
        type="submit"
        className="w-full sm:w-auto shrink-0 rounded-lg bg-[#960DF2] hover:bg-[#780AC2] text-white px-6 py-3 text-xs font-bold shadow-md shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-95 transition-all cursor-pointer"
      >
        {buttonText}
      </button>
    </form>
  );
}
