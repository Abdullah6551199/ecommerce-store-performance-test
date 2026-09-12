"use client";

import React, { useEffect } from "react";
import ReviewsManager from "@/components/admin/ReviewsManager";

export default function AdminReviewsPage(): React.JSX.Element {
  useEffect(() => {
    document.title = "Reviews & Ratings Moderation - Admin Panel";
  }, []);

  return <ReviewsManager />;
}
