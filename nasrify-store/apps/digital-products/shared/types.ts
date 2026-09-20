export interface DigitalFile {
  id?: string;
  name: string;
  size: number;
  mime: string;
  r2_key: string;
}

export interface DigitalProduct {
  id: string;
  productId: string;
  filesJson: string;
  files?: DigitalFile[];
  downloadLimit: number;
  expiryDays: number;
  licenseEnabled: number;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface DigitalDownload {
  id: string;
  orderId: string;
  productId: string;
  customerId: string | null;
  customerEmail: string | null;
  fileName: string;
  r2Key: string;
  downloadToken: string;
  downloadedCount: number;
  maxDownloads: number;
  expiresAt: number | null;
  createdAt: number;
  lastDownloadAt: number | null;
  productName?: string;
  productImage?: string | null;
  licenseKey?: string | null;
}

export interface DigitalLicense {
  id: string;
  orderId: string;
  productId: string;
  licenseKey: string;
  customerEmail: string | null;
  status: "active" | "revoked";
  createdAt: number;
}

export interface DigitalProductsSettings {
  enabled: boolean;
  defaultDownloadLimit: number;
  defaultExpiryDays: number;
  enableLicenseKeys: boolean;
  downloadButtonText: string;
  emailDownloadLink: boolean;
}
