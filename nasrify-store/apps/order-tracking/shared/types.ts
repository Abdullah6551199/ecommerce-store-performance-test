export interface OrderTrackingAppSettings {
  enablePublicTracking: boolean;
  enableAutoNotifications: boolean;
  showCourierField: boolean;
  showTimeline: boolean;
  timelineStages: string;
  estimatedDeliveryDays: number;
}

export const DEFAULT_ORDER_TRACKING_SETTINGS: OrderTrackingAppSettings = {
  enablePublicTracking: true,
  enableAutoNotifications: true,
  showCourierField: true,
  showTimeline: true,
  timelineStages: "Pending,Confirmed,Packed,Shipped,Out for Delivery,Delivered",
  estimatedDeliveryDays: 5,
};

export interface TrackedOrderItem {
  id: string;
  productName: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface TrackedOrder {
  id: string;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
  courierName?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  statusNotes?: string | null;
  customerName?: string;
  phone?: string;
  email?: string | null;
  address?: string;
  city?: string;
  subtotal?: number;
  shipping?: number;
  discountAmount?: number;
  discountCode?: string | null;
  total?: number;
  paymentMethod?: string;
  items?: TrackedOrderItem[];
}

export interface TimelineStepDef {
  key: string;
  title: string;
  description: string;
}
