import { cache } from "react";
import { eq, desc, asc, and, sql } from "drizzle-orm";
import {
  getDb,
  pages,
  faqs,
  contactMessages,
  type PageRecord,
  type FaqRecord,
  type ContactMessageRecord,
} from "./db";

/**
 * ==============================================================================
 * Stage 15: Content Management System (CMS) & FAQs Services
 * ==============================================================================
 */

export interface PageInput {
  title: string;
  slug: string;
  content?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  showInFooter?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface FaqInput {
  question: string;
  answer: string;
  category?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}

// Default template content for core pages
export const DEFAULT_PAGE_TEMPLATES: Record<string, { title: string; content: string; seoTitle: string; seoDescription: string }> = {
  about: {
    title: "About Us",
    content: `<h1>About ApexStore</h1>
<p>Welcome to <strong>ApexStore</strong>! We are passionate about engineering high-performance athletic footwear, technical training apparel, and competition accessories designed for peak human performance.</p>
<h2>Our Mission</h2>
<p>To empower athletes and active creators through uncompromising technical innovation, sustainable material craftsmanship, and human-centric ergonomics.</p>
<h2>Why Choose Us</h2>
<ul>
  <li><strong>Rigorously Tested:</strong> Every fabric and contour is subjected to intensive training and field trials.</li>
  <li><strong>Rapid Global Shipping:</strong> Fast turnaround with transparent order updates at every milestone.</li>
  <li><strong>Athlete-Centric Support:</strong> A dedicated support team ready to assist with sizing and performance recommendations.</li>
  <li><strong>Secure Checkout:</strong> Industry-standard edge encryption and flexible payment methods including Cash on Delivery (COD).</li>
</ul>`,
    seoTitle: "About Us | ApexStore Performance Gear",
    seoDescription: "Discover the engineering mission and performance craft behind ApexStore technical apparel and footwear.",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    content: `<h1>Privacy Policy</h1>
<p><em>Last updated: September 2026</em></p>
<h2>1. Information We Collect</h2>
<p>We collect information you supply when placing an order, registering an account, or communicating with us. This includes your name, email, delivery address, and telephone number.</p>
<h2>2. How We Use Information</h2>
<p>We use this information exclusively to process and deliver orders, prevent fraud, improve storefront speed, and communicate vital purchase updates.</p>
<h2>3. Cookies & Session Storage</h2>
<p>We use essential cookies to maintain shopping cart states, remember wishlist preferences, and preserve dark/light theme choices.</p>
<h2>4. Third-Party Services</h2>
<p>We never sell or distribute your personal records. Infrastructure partners operate under strict confidentiality and encryption protocols.</p>
<h2>5. Your Rights</h2>
<p>You may request inspection, correction, or deletion of your stored details at any time by contacting support@apexstore.com.</p>`,
    seoTitle: "Privacy Policy | ApexStore",
    seoDescription: "Understand how ApexStore protects your personal details, cookies, and order transactions.",
  },
  terms: {
    title: "Terms & Conditions",
    content: `<h1>Terms & Conditions</h1>
<p><em>Last updated: September 2026</em></p>
<h2>1. Agreement to Terms</h2>
<p>By browsing or placing an order on ApexStore, you agree to be bound by these Terms and Conditions and our Privacy Policy.</p>
<h2>2. Purchases and Availability</h2>
<p>All items are subject to stock availability. In the rare event of inventory exhaustion, customer service will notify you immediately for a full refund or exchange.</p>
<h2>3. Cash on Delivery (COD)</h2>
<p>For orders placed via COD, please ensure that contact information and destination addresses are accurate to ensure prompt courier delivery.</p>
<h2>4. Intellectual Property</h2>
<p>All design assets, trademarks, photography, and text content remain the exclusive property of ApexStore.</p>`,
    seoTitle: "Terms & Conditions | ApexStore",
    seoDescription: "Review the terms and conditions governing purchases and usage at ApexStore.",
  },
  returns: {
    title: "Returns & Exchanges Policy",
    content: `<h1>Returns & Exchanges Policy</h1>
<h2>30-Day Money-Back Guarantee</h2>
<p>We want you to train with complete confidence. If you are not fully satisfied, you may initiate a return or exchange within <strong>30 days</strong> of confirmed delivery.</p>
<h2>Conditions for Return</h2>
<ul>
  <li>Items must be unworn, unwashed, and in original packaging with all technical tags intact.</li>
  <li>Footwear must include the original shoe box undamaged.</li>
  <li>Order number or receipt must be provided.</li>
</ul>
<h2>Return Instructions</h2>
<ol>
  <li>Contact customer support via our Contact page with your Order ID.</li>
  <li>Print the prepaid courier return slip sent to your email.</li>
  <li>Drop off the package at any authorized parcel locker or depot.</li>
  <li>Refunds are credited within 3–5 business days after inspection.</li>
</ol>`,
    seoTitle: "Returns & Exchanges | ApexStore",
    seoDescription: "30-day hassle-free return and exchange instructions for ApexStore footwear and technical apparel.",
  },
  shipping: {
    title: "Shipping & Delivery Information",
    content: `<h1>Shipping & Delivery Information</h1>
<h2>Shipping Options & Speeds</h2>
<ul>
  <li><strong>Standard Ground Delivery (3–5 Business Days):</strong> $5.00 flat rate — <strong>FREE on orders over $100</strong>.</li>
  <li><strong>Express Air Shipping (1–2 Business Days):</strong> $15.00 flat rate for prioritized rush delivery.</li>
  <li><strong>International Expedited (7–14 Business Days):</strong> Calculated automatically based on your destination country.</li>
</ul>
<h2>Order Dispatch Schedule</h2>
<p>Orders confirmed by 2:00 PM EST on business days depart our distribution hub on the same day. Tracking links are emailed immediately upon courier intake.</p>`,
    seoTitle: "Shipping & Delivery Information | ApexStore",
    seoDescription: "Review shipping costs, carrier speeds, dispatch timelines, and delivery tracking at ApexStore.",
  },
  contact: {
    title: "Contact Us",
    content: `<h1>Contact ApexStore</h1>
<p>Have inquiries regarding product sizing, order tracking, returns, or technical specifications? Our dedicated support staff is here to help.</p>`,
    seoTitle: "Contact Us | ApexStore Support",
    seoDescription: "Get in touch with the ApexStore athlete support team for order inquiries, sizing questions, or feedback.",
  },
};

/**
 * ==============================================================================
 * Pages Operations
 * ==============================================================================
 */

/**
 * Get a published page by slug (publicly cached)
 */
export const getPageBySlug = cache(async (slug: string): Promise<PageRecord | null> => {
  const normalized = slug.toLowerCase().trim();
  const db = getDb();

  if (db) {
    try {
      const rows = await db
        .select()
        .from(pages)
        .where(and(eq(pages.slug, normalized), eq(pages.isPublished, true)))
        .limit(1);

      if (rows && rows.length > 0) {
        return rows[0];
      }
    } catch (err) {
      console.warn("[getPageBySlug] D1 query failed, using fallback:", err);
    }
  }

  // Fallback to default template if available
  if (DEFAULT_PAGE_TEMPLATES[normalized]) {
    const tpl = DEFAULT_PAGE_TEMPLATES[normalized];
    return {
      id: `default-${normalized}`,
      tenantId: "default",
      slug: normalized,
      title: tpl.title,
      content: tpl.content,
      seoTitle: tpl.seoTitle,
      seoDescription: tpl.seoDescription,
      ogImage: null,
      showInFooter: true,
      isPublished: true,
      isDefault: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return null;
});

/**
 * Get any page by slug (admin view, includes drafts)
 */
export async function getPageBySlugAdmin(slug: string): Promise<PageRecord | null> {
  const normalized = slug.toLowerCase().trim();
  const db = getDb();

  if (db) {
    try {
      const rows = await db
        .select()
        .from(pages)
        .where(eq(pages.slug, normalized))
        .limit(1);

      if (rows && rows.length > 0) {
        return rows[0];
      }
    } catch (err) {
      console.warn("[getPageBySlugAdmin] D1 query failed:", err);
    }
  }

  if (DEFAULT_PAGE_TEMPLATES[normalized]) {
    const tpl = DEFAULT_PAGE_TEMPLATES[normalized];
    return {
      id: `default-${normalized}`,
      tenantId: "default",
      slug: normalized,
      title: tpl.title,
      content: tpl.content,
      seoTitle: tpl.seoTitle,
      seoDescription: tpl.seoDescription,
      ogImage: null,
      showInFooter: true,
      isPublished: true,
      isDefault: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Get single page by ID
 */
export async function getPageById(id: string): Promise<PageRecord | null> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(pages)
        .where(eq(pages.id, id))
        .limit(1);
      return rows[0] || null;
    } catch (err) {
      console.warn("[getPageById] D1 query failed:", err);
    }
  }
  return null;
}

/**
 * List all pages (admin)
 */
export async function listAllPages(): Promise<PageRecord[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(pages)
        .orderBy(asc(pages.sortOrder), desc(pages.updatedAt));
      return rows;
    } catch (err) {
      console.warn("[listAllPages] D1 query failed:", err);
    }
  }
  return [];
}

export const listPages = listAllPages;

/**
 * Create a new page
 */
export async function createPage(input: PageInput): Promise<PageRecord> {
  const db = getDb();
  const id = `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: PageRecord = {
    id,
    tenantId: "default",
    slug: input.slug.toLowerCase().trim(),
    title: input.title.trim(),
    content: input.content || "",
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    ogImage: input.ogImage || null,
    showInFooter: Boolean(input.showInFooter),
    isPublished: input.isPublished !== undefined ? Boolean(input.isPublished) : true,
    isDefault: false,
    sortOrder: input.sortOrder || 0,
    createdAt: now,
    updatedAt: now,
  };

  if (db) {
    await db.insert(pages).values(record);
  }

  return record;
}

/**
 * Update an existing page
 */
export async function updatePage(id: string, input: Partial<PageInput>): Promise<PageRecord | null> {
  const db = getDb();
  if (!db) return null;

  const existing = await getPageById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: Partial<PageRecord> = {
    ...input,
    slug: input.slug ? input.slug.toLowerCase().trim() : existing.slug,
    title: input.title ? input.title.trim() : existing.title,
    updatedAt: now,
  };

  await db.update(pages).set(updated).where(eq(pages.id, id));
  return { ...existing, ...updated } as PageRecord;
}

/**
 * Reset a page to its default template
 */
export async function resetPageToDefault(id: string): Promise<PageRecord | null> {
  const db = getDb();
  if (!db) return null;

  const existing = await getPageById(id);
  if (!existing) return null;

  const tpl = DEFAULT_PAGE_TEMPLATES[existing.slug];
  if (!tpl) {
    throw new Error(`No default template exists for slug: ${existing.slug}`);
  }

  const now = new Date().toISOString();
  await db
    .update(pages)
    .set({
      title: tpl.title,
      content: tpl.content,
      seoTitle: tpl.seoTitle,
      seoDescription: tpl.seoDescription,
      updatedAt: now,
    })
    .where(eq(pages.id, id));

  return {
    ...existing,
    title: tpl.title,
    content: tpl.content,
    seoTitle: tpl.seoTitle,
    seoDescription: tpl.seoDescription,
    updatedAt: now,
  };
}

/**
 * Delete a custom page (default pages cannot be deleted)
 */
export async function deletePage(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const existing = await getPageById(id);
  if (!existing) return false;
  if (existing.isDefault) {
    throw new Error("System default pages cannot be deleted.");
  }

  await db.delete(pages).where(eq(pages.id, id));
  return true;
}

export const DEFAULT_FAQS: FaqRecord[] = [
  {
    id: "faq-1",
    tenantId: "default",
    question: "What is your standard delivery timeframe?",
    answer: "Orders are packed and dispatched within 24 to 48 business hours. Domestic standard ground shipping takes 3–5 business days, while express air priority delivery typically takes 1–2 business days.",
    category: "Shipping",
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-2",
    tenantId: "default",
    question: "How do I track my active order?",
    answer: "As soon as your shipment departs our fulfillment warehouse, you will receive an automatic email containing your carrier tracking link. You can also contact support with your Order ID for real-time status updates.",
    category: "Orders",
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-3",
    tenantId: "default",
    question: "What is your return policy?",
    answer: "We offer an unconditional 30-day return window on all unworn gear in original condition with tags attached. Please visit our Returns page for step-by-step return label generation.",
    category: "Returns",
    sortOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-4",
    tenantId: "default",
    question: "Do you ship internationally?",
    answer: "Yes! We deliver to over 60 countries worldwide. International shipping transit times range from 7 to 14 business days, and duties/taxes are calculated dynamically at checkout.",
    category: "Shipping",
    sortOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-5",
    tenantId: "default",
    question: "Can I cancel or modify an order after placing it?",
    answer: "If your order has not yet been processed by our logistics facility, we can update the shipping address or cancel the order. Please reach out to us immediately via the Contact page.",
    category: "Orders",
    sortOrder: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-6",
    tenantId: "default",
    question: "How do promotional discount codes work?",
    answer: "Simply enter your coupon code in the discount field during checkout. The applicable savings percentage or fixed deduction will immediately calculate into your cart subtotal.",
    category: "Payment",
    sortOrder: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * List active FAQs for storefront display (publicly cached)
 */
export const getActiveFaqs = cache(async (): Promise<FaqRecord[]> => {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(faqs)
        .where(eq(faqs.isActive, true))
        .orderBy(asc(faqs.sortOrder), asc(faqs.createdAt));
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.warn("[getActiveFaqs] D1 query failed:", err);
    }
  }
  return DEFAULT_FAQS;
});

/**
 * List all FAQs (admin)
 */
export async function listAllFaqs(): Promise<FaqRecord[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(faqs)
        .orderBy(asc(faqs.sortOrder), desc(faqs.createdAt));
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.warn("[listAllFaqs] D1 query failed:", err);
    }
  }
  return DEFAULT_FAQS;
}

/**
 * Create a new FAQ
 */
export async function createFaq(input: FaqInput): Promise<FaqRecord> {
  const db = getDb();
  const id = `faq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: FaqRecord = {
    id,
    tenantId: "default",
    question: input.question.trim(),
    answer: input.answer.trim(),
    category: input.category?.trim() || "General",
    sortOrder: input.sortOrder || 0,
    isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
    createdAt: now,
    updatedAt: now,
  };

  if (db) {
    await db.insert(faqs).values(record);
  }

  return record;
}

/**
 * Update an existing FAQ
 */
export async function updateFaq(id: string, input: Partial<FaqInput>): Promise<FaqRecord | null> {
  const db = getDb();
  if (!db) return null;

  const existingRows = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
  if (!existingRows || existingRows.length === 0) return null;

  const now = new Date().toISOString();
  const updated: Partial<FaqRecord> = {
    ...input,
    question: input.question ? input.question.trim() : undefined,
    answer: input.answer ? input.answer.trim() : undefined,
    category: input.category !== undefined ? (input.category?.trim() || "General") : undefined,
    updatedAt: now,
  };

  await db.update(faqs).set(updated).where(eq(faqs.id, id));
  return { ...existingRows[0], ...updated } as FaqRecord;
}

/**
 * Delete an FAQ
 */
export async function deleteFaq(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  await db.delete(faqs).where(eq(faqs.id, id));
  return true;
}

/**
 * Reorder FAQs batch update
 */
export async function reorderFaqs(items: Array<{ id: string; sortOrder: number }>): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  for (const item of items) {
    await db
      .update(faqs)
      .set({ sortOrder: item.sortOrder, updatedAt: new Date().toISOString() })
      .where(eq(faqs.id, item.id));
  }
  return true;
}

/**
 * ==============================================================================
 * Contact Messages Operations
 * ==============================================================================
 */

/**
 * Save customer contact message to D1
 */
export async function saveContactMessage(input: ContactMessageInput): Promise<ContactMessageRecord> {
  const db = getDb();
  const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: ContactMessageRecord = {
    id,
    tenantId: "default",
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    subject: input.subject?.trim() || null,
    message: input.message.trim(),
    isRead: false,
    createdAt: now,
  };

  if (db) {
    await db.insert(contactMessages).values(record);
  }

  return record;
}

/**
 * List contact messages (admin)
 */
export async function listContactMessages(): Promise<ContactMessageRecord[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(contactMessages)
        .orderBy(desc(contactMessages.createdAt));
      return rows;
    } catch (err) {
      console.warn("[listContactMessages] D1 query failed:", err);
    }
  }
  return [];
}
