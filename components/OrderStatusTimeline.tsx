"use client";

import OrderTimeline from "@/apps/order-tracking/storefront/OrderTimeline";
import type { TrackedOrder } from "@/apps/order-tracking/shared/types";

export type OrderTimelineData = TrackedOrder;

export default function OrderStatusTimeline(props: { order: TrackedOrder }): React.JSX.Element {
  return <OrderTimeline {...props} />;
}
