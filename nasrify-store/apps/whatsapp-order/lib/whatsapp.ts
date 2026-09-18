/**
 * Helper utilities for WhatsApp Link Generation and Message Formatting
 */

export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return "";
  return phone.replace(/[^\d]/g, "");
}

export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = sanitizePhoneNumber(phone);
  return cleaned.length >= 7 && cleaned.length <= 15;
}

export function formatWhatsAppUrl(phone: string, text?: string): string {
  const cleaned = sanitizePhoneNumber(phone);
  if (!cleaned) return "#";
  const baseUrl = `https://wa.me/${cleaned}`;
  if (!text || text.trim().length === 0) {
    return baseUrl;
  }
  return `${baseUrl}?text=${encodeURIComponent(text.trim())}`;
}

export function formatPrice(price: number | string | undefined | null): string {
  if (price === undefined || price === null || price === "") return "$0.00";
  if (typeof price === "string" && price.startsWith("$")) return price;
  const num = Number(price);
  return isNaN(num) ? String(price) : `$${num.toFixed(2)}`;
}

export interface ProductMessageItem {
  name: string;
  price?: number | string;
  quantity?: number;
  url?: string;
  imageUrl?: string | null;
}

/**
 * Builds standard WhatsApp order message for a single product item.
 */
export function buildProductMessage(item: ProductMessageItem): string {
  const name = item.name || "Product";
  const price = formatPrice(item.price);
  const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
  const link = item.url || (typeof window !== "undefined" ? window.location.href : "");

  let msg = `Hello! I want to order:\n\n*Product:* ${name}\n*Price:* ${price}\n*Quantity:* ${qty}\n*Link:* ${link}`;
  if (item.imageUrl && item.imageUrl.startsWith("http")) {
    msg += `\n*Image:* ${item.imageUrl}`;
  }
  msg += `\n\nPlease confirm availability.`;
  return msg;
}

export interface CartMessageItem {
  name: string;
  price: number | string;
  quantity: number;
  lineTotal?: number | string;
  url?: string;
  imageUrl?: string | null;
}

export interface CartMessageTotals {
  subtotal: number | string;
  total: number | string;
}

/**
 * Builds standard WhatsApp order message for multiple cart/checkout items.
 */
export function buildCartMessage(
  items: CartMessageItem[],
  totals: CartMessageTotals
): string {
  if (!items || items.length === 0) {
    return `Hello! I would like to inquire about placing an order.\n\nPlease let me know how to proceed.`;
  }

  const itemsText = items
    .map((item, idx) => {
      const name = item.name || `Item ${idx + 1}`;
      const price = formatPrice(item.price);
      const qty = item.quantity || 1;
      const numPrice =
        typeof item.price === "number"
          ? item.price
          : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;
      const lineTotal = item.lineTotal
        ? formatPrice(item.lineTotal)
        : formatPrice(numPrice * qty);
      const link = item.url || "";

      let block = `${idx + 1}. ${name}\n   Price: ${price} x ${qty} = ${lineTotal}`;
      if (link) {
        block += `\n   Link: ${link}`;
      }
      if (item.imageUrl && item.imageUrl.startsWith("http")) {
        block += `\n   Image: ${item.imageUrl}`;
      }
      return block;
    })
    .join("\n\n");

  const subtotalStr = formatPrice(totals.subtotal);
  const totalStr = formatPrice(totals.total);

  return `Hello! I want to place this order:\n\n${itemsText}\n\n*Subtotal:* ${subtotalStr}\n*Total:* ${totalStr}\n\nPlease confirm availability.`;
}

/**
 * Backwards compatibility helper for custom string templates
 */
export function interpolateProductMessage(
  template: string,
  product: {
    name?: string;
    price?: number | string;
    url?: string;
    quantity?: number;
    imageUrl?: string | null;
  }
): string {
  if (template && template.includes("{product_name}")) {
    let result = template;
    const name = product.name || "Product";
    const price = product.price !== undefined ? formatPrice(product.price) : "";
    const url = product.url || (typeof window !== "undefined" ? window.location.href : "");

    result = result.replace(/\{product_name\}/g, name);
    result = result.replace(/\{product_price\}/g, price);
    result = result.replace(/\{product_url\}/g, url);
    return result;
  }

  return buildProductMessage(product as ProductMessageItem);
}
