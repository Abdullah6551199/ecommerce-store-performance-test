"use client";

import React from "react";
import Button from "@/components/themes/blocks/Button";

export default function OpenCookiePreferencesButton(): React.JSX.Element {
  const handleOpen = () => {
    window.dispatchEvent(new CustomEvent("apex_open_cookie_preferences"));
  };

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleOpen}
      className="inline-flex items-center gap-2"
    >
      <span>🍪</span>
      <span>Manage Cookie Preferences</span>
    </Button>
  );
}
