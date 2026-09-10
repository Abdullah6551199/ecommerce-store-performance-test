import { getDb, orders } from "./db";
import { desc } from "drizzle-orm";

export interface CustomerRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orderIds: string[];
}

export interface CustomersSummary {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface GetCustomersResult {
  customers: CustomerRecord[];
  summary: CustomersSummary;
  total: number;
  totalPages: number;
  page: number;
}

/**
 * Normalizes customer identifiers (email or phone) to aggregate unique customer profiles
 */
function normalizeCustomerKey(email?: string | null, phone?: string | null): string {
  const normEmail = (email || "").toLowerCase().trim();
  const normPhone = (phone || "").replace(/[^\d+]/g, "").trim();

  if (normEmail) return `email:${normEmail}`;
  if (normPhone) return `phone:${normPhone}`;
  return "anonymous";
}

/**
 * Retrieves and aggregates customer profiles dynamically from orders in D1 with pagination
 */
export async function getCustomers(options?: {
  search?: string;
  limit?: number;
  page?: number;
}): Promise<GetCustomersResult> {
  const db = getDb();
  let allOrders: Array<{
    id: string;
    customerName: string;
    phone: string;
    email: string | null;
    address: string;
    city: string;
    total: number;
    createdAt: string;
  }> = [];

  if (db) {
    try {
      allOrders = await db
        .select({
          id: orders.id,
          customerName: orders.customerName,
          phone: orders.phone,
          email: orders.email,
          address: orders.address,
          city: orders.city,
          total: orders.total,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .orderBy(desc(orders.createdAt));
    } catch (err) {
      console.warn("[Customers] D1 orders query failed:", err);
    }
  }

  // Aggregate orders by unique customer
  const customerMap = new Map<string, CustomerRecord>();

  for (const o of allOrders) {
    const key = normalizeCustomerKey(o.email, o.phone);
    const existing = customerMap.get(key);

    if (!existing) {
      customerMap.set(key, {
        id: o.id, // Primary customer anchor ID
        name: o.customerName || "Valued Customer",
        email: o.email || null,
        phone: o.phone || "",
        address: o.address || "",
        city: o.city || "",
        totalOrders: 1,
        totalSpent: Number(o.total) || 0,
        lastOrderDate: o.createdAt,
        orderIds: [o.id],
      });
    } else {
      existing.totalOrders += 1;
      existing.totalSpent = Number((existing.totalSpent + (Number(o.total) || 0)).toFixed(2));
      existing.orderIds.push(o.id);
      // Keep most descriptive/recent address
      if (!existing.email && o.email) existing.email = o.email;
      if (!existing.address && o.address) existing.address = o.address;
      if (!existing.city && o.city) existing.city = o.city;
    }
  }

  let customerList = Array.from(customerMap.values());

  // Search filter
  const searchQuery = (options?.search || "").toLowerCase().trim();
  if (searchQuery) {
    customerList = customerList.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery) ||
        (c.email && c.email.toLowerCase().includes(searchQuery)) ||
        c.phone.includes(searchQuery) ||
        c.city.toLowerCase().includes(searchQuery)
    );
  }

  // Sort by latest order date descending
  customerList.sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());

  // Calculate global summary metrics before pagination
  const totalRevenue = customerList.reduce((acc, c) => acc + c.totalSpent, 0);
  const totalOrdersCount = customerList.reduce((acc, c) => acc + c.totalOrders, 0);
  const averageOrderValue =
    totalOrdersCount > 0 ? Number((totalRevenue / totalOrdersCount).toFixed(2)) : 0;

  const total = customerList.length;
  const limit = options?.limit && options.limit > 0 ? options.limit : 20;
  const page = options?.page && options.page > 0 ? options.page : 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const paginatedList = customerList.slice(offset, offset + limit);

  return {
    customers: paginatedList,
    summary: {
      totalCustomers: total,
      totalOrders: totalOrdersCount,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      averageOrderValue,
    },
    total,
    totalPages,
    page,
  };
}
