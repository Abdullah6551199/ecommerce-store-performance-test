export type BroadcastType = "info" | "promotion" | "announcement" | "warning";
export type BroadcastTarget = "all" | "registered" | "guest";
export type BroadcastStatus = "sent" | "draft" | "scheduled" | "archived";

export interface BroadcastAppSettings {
  enablePopup: boolean;
  popupPosition: "top" | "center" | "bottom";
  popupDelaySeconds: number;
  showOncePerCustomer: boolean;
  enableExpiryDate: boolean;
  maxActiveBroadcasts: number;
}

export const DEFAULT_BROADCAST_SETTINGS: BroadcastAppSettings = {
  enablePopup: true,
  popupPosition: "top",
  popupDelaySeconds: 3,
  showOncePerCustomer: true,
  enableExpiryDate: true,
  maxActiveBroadcasts: 1,
};

export interface CreateBroadcastInput {
  title: string;
  message: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  buttonText?: string | null;
  type?: BroadcastType;
  target?: BroadcastTarget;
  scheduledFor?: string | null;
}

export interface BroadcastStats {
  totalViews: number;
  totalDismissed: number;
  viewRate: number;
  totalClicks: number;
  ctr: number;
}

export interface BroadcastItem {
  id: string;
  title: string;
  message: string;
  imageUrl: string | null;
  linkUrl: string | null;
  buttonText: string | null;
  type: BroadcastType;
  target: BroadcastTarget;
  status: BroadcastStatus;
  scheduledFor: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastAdminItem extends BroadcastItem {
  stats: BroadcastStats;
}

export interface BroadcastStorefrontData {
  id: string;
  title: string;
  message: string;
  imageUrl: string | null;
  linkUrl: string | null;
  buttonText: string | null;
  type: BroadcastType;
  target: BroadcastTarget;
  createdAt: string;
}
