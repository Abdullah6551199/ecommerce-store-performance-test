"use client";

import React from "react";

export default function OpenCookiePreferencesButton(): React.JSX.Element {
  const handleOpen = () => {
    window.dispatchEvent(new CustomEvent("apex_open_cookie_preferences"));
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="inline-flex items-center gap-2 rounded-xl bg-[#960DF2] hover:bg-[#AB3DF5] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/25 transition-all cursor-pointer active:scale-95 shrink-0"
    >
      <span>🍪</span>
      <span>Manage Cookie Preferences</span>
    </button>
  );
}
