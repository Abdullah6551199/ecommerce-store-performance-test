"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AdminLoadingSkeleton from "@/components/admin/AdminLoadingSkeleton";

const ReviewsManager = dynamic(
  () => import("@/components/admin/ReviewsManager"),
  { ssr: false, loading: () => <AdminLoadingSkeleton title="Loading Reviews Moderation..." /> }
);

export default function AdminReviewsPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Reviews & Ratings Moderation - Admin Panel";
  }, []);

  return <ReviewsManager />;
}
