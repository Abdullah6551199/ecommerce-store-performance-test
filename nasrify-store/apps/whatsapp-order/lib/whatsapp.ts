/**
 * Helper utilities for WhatsApp Link Generation and Formatting
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

export function interpolateProductMessage(
  template: string,
  product: {
    name?: string;
    price?: number | string;
    url?: string;
  }
): string {
  let result = template || "Hello! I would like to order: {product_name} ({product_url})";
  const name = product.name || "Product";
  const price = product.price !== undefined ? String(product.price) : "";
  const url = product.url || (typeof window !== "undefined" ? window.location.href : "");

  result = result.replace(/\{product_name\}/g, name);
  result = result.replace(/\{product_price\}/g, price);
  result = result.replace(/\{product_url\}/g, url);

  return result;
}
