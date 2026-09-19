/**
 * Helper utilities for WhatsApp Link Generation and Message Formatting (Stage 29.6)
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
  if (typeof price === "string" && (price.startsWith("$") || price.startsWith("Rs."))) return price;
  const num = Number(price);
  return isNaN(num) ? String(price) : `$${num.toFixed(2)}`;
}

export interface WhatsAppCustomerInfo {
  name?: string;
  phone?: string;
  email?: string | null;
  address?: string;
  city?: string;
  postalCode?: string | null;
  notes?: string | null;
}

export interface ProductMessageItem {
  name: string;
  price?: number | string;
  quantity?: number;
  url?: string;
  imageUrl?: string | null;
}

export interface ProductMessageOptions {
  customer?: WhatsAppCustomerInfo;
  orderRef?: string;
  shipping?: number | string;
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
  shipping?: number | string;
  total: number | string;
}

export interface CartMessageOptions {
  customer?: WhatsAppCustomerInfo;
  orderRef?: string;
}

function formatDeliveryDetails(customer?: WhatsAppCustomerInfo): string {
  if (!customer || (!customer.name && !customer.phone && !customer.address)) {
    return "";
  }

  const lines: string[] = [
    "📍 DELIVERY DETAILS",
    "━━━━━━━━━━━━━━━━━",
  ];

  if (customer.name) lines.push(`Name: ${customer.name}`);
  if (customer.phone) lines.push(`Phone: ${customer.phone}`);
  if (customer.email) lines.push(`Email: ${customer.email}`);
  if (customer.address) lines.push(`Address: ${customer.address}`);
  if (customer.city) lines.push(`City: ${customer.city}`);
  if (customer.postalCode) lines.push(`Postal Code: ${customer.postalCode}`);
  if (customer.notes) lines.push(`Notes: ${customer.notes}`);

  return lines.join("\n");
}

function formatOrderRef(orderRef?: string): string {
  if (!orderRef) return "";
  const cleanRef = orderRef.startsWith("#") ? orderRef : `#${orderRef}`;
  return `Order Reference: ${cleanRef}`;
}

/**
 * Builds standard clean WhatsApp order message for a single product.
 */
export function buildProductMessage(
  item: ProductMessageItem,
  options?: ProductMessageOptions
): string {
  const name = item.name || "Product";
  const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
  const unitPrice = formatPrice(item.price);
  const numPrice = typeof item.price === "number" ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;
  const lineTotal = formatPrice(numPrice * qty);
  const link = item.url || (typeof window !== "undefined" ? window.location.href : "");

  let itemBlock = `${name}\nQty: ${qty} × ${unitPrice} = ${lineTotal}`;
  if (link) {
    itemBlock += `\nLink: ${link}`;
  }

  const sections: string[] = [
    "Hello! I want to place this order:\n",
    "🛒 ORDER DETAILS\n━━━━━━━━━━━━━━━━━\n\n" + itemBlock,
    "━━━━━━━━━━━━━━━━━",
  ];

  if (options?.shipping !== undefined && Number(options.shipping) > 0) {
    sections.push(`Subtotal: ${lineTotal}`);
    sections.push(`*Shipping:* ${formatPrice(options.shipping)}`);
    sections.push(`Total: ${formatPrice(numPrice * qty + Number(options.shipping))}`);
  } else {
    sections.push(`Total: ${lineTotal}`);
  }

  const deliveryText = formatDeliveryDetails(options?.customer);
  if (deliveryText) {
    sections.push(`\n${deliveryText}`);
  }

  const refText = formatOrderRef(options?.orderRef);
  if (refText) {
    sections.push(refText);
  }

  sections.push("\nPlease confirm my order.");

  return sections.join("\n").replace(/\n{3,}/g, "\n\n");
}

/**
 * Builds clean WhatsApp order message for cart & checkout items according to Stage 29.6 specification.
 */
export function buildCartMessage(
  items: CartMessageItem[],
  totals: CartMessageTotals,
  options?: CartMessageOptions
): string {
  if (!items || items.length === 0) {
    return "Hello! I would like to inquire about placing an order.\n\nPlease let me know how to proceed.";
  }

  const productsBlock = items
    .map((item) => {
      const name = item.name || "Product";
      const qty = item.quantity || 1;
      const unitPrice = formatPrice(item.price);
      const numPrice =
        typeof item.price === "number"
          ? item.price
          : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;
      const lineTotal = item.lineTotal
        ? formatPrice(item.lineTotal)
        : formatPrice(numPrice * qty);
      const link = item.url || "";

      let block = `${name}\nQty: ${qty} × ${unitPrice} = ${lineTotal}`;
      if (link) {
        block += `\nLink: ${link}`;
      }
      return block;
    })
    .join("\n\n");

  const subtotalStr = formatPrice(totals.subtotal);
  const totalStr = formatPrice(totals.total);

  const sections: string[] = [
    "Hello! I want to place this order:\n",
    "🛒 ORDER DETAILS\n━━━━━━━━━━━━━━━━━\n\n" + productsBlock,
    "━━━━━━━━━━━━━━━━━\nSubtotal: " + subtotalStr,
  ];

  if (totals.shipping !== undefined && Number(totals.shipping) > 0) {
    sections.push(`*Shipping:* ${formatPrice(totals.shipping)}`);
  }

  sections.push(`Total: ${totalStr}`);

  const deliveryText = formatDeliveryDetails(options?.customer);
  if (deliveryText) {
    sections.push(`\n${deliveryText}`);
  }

  const refText = formatOrderRef(options?.orderRef);
  if (refText) {
    sections.push(refText);
  }

  sections.push("\nPlease confirm my order.");

  return sections.join("\n").replace(/\n{3,}/g, "\n\n");
}

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
