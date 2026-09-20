import { getDb } from "@/lib/db";
import { getDigitalProductByProductId } from "./digital-products";
import { createDownloadRecords } from "./downloads";
import { generateLicenseKey } from "./tokens";

export interface OrderHookItem {
  productId: string;
  quantity?: number;
  price?: number;
}

export interface OrderHookOrder {
  id: string;
  customerId?: string | null;
  customerEmail?: string | null;
}

/**
 * Non-blocking hook invoked when an order is created.
 * Detects digital items, generates secure download tokens, and provisions license keys.
 */
export async function hookAfterOrderPlaced(
  order: OrderHookOrder,
  items: OrderHookItem[]
): Promise<{ digitalItemCount: number; tokensCreated: number }> {
  let digitalItemCount = 0;
  let tokensCreated = 0;

  if (!order || !order.id || !items || items.length === 0) {
    return { digitalItemCount: 0, tokensCreated: 0 };
  }

  try {
    for (const item of items) {
      if (!item.productId) continue;

      const dp = await getDigitalProductByProductId(item.productId);
      if (!dp || !dp.files || dp.files.length === 0) {
        continue;
      }

      digitalItemCount++;

      // Check if license key should be generated
      const licenseKey = dp.licenseEnabled ? generateLicenseKey() : null;

      const tokens = await createDownloadRecords({
        orderId: order.id,
        productId: item.productId,
        customerId: order.customerId,
        customerEmail: order.customerEmail,
        files: dp.files,
        maxDownloads: dp.downloadLimit,
        expiryDays: dp.expiryDays,
        licenseKey,
      });

      tokensCreated += tokens.length;
    }
  } catch (_err) {
    // Non-blocking: Order completion must never fail if digital hook encounters an error
  }

  return { digitalItemCount, tokensCreated };
}
