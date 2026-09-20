"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

const AIReviewGeneratorManager = dynamic(
  () => import("@/apps/ai-review-generator/admin/AIReviewGeneratorManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading AI Review Generator..." /> }
);

export default function AdminAIReviewGeneratorPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "AI Review Generator - Admin Panel";
  }, []);

  return (
    <AdminErrorBoundary moduleName="AI Review Generator">
      <AIReviewGeneratorManager />
    </AdminErrorBoundary>
  );
}
