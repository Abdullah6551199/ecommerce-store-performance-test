import { getDb, orders, customers, customerAddresses, reviews } from "./db";
import { desc, eq, or, sql } from "drizzle-orm";

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
  isRegistered: boolean;
  status: "active" | "suspended";
  registeredCustomerId?: string;
}

export interface CustomerDetailRecord extends CustomerRecord {
  addresses: Array<{
    id: string;
    label: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postalCode: string | null;
    isDefault: boolean;
  }>;
  reviews: Array<{
    id: string;
    productId: string;
    rating: number;
    title: string | null;
    content: string;
    status: string;
    createdAt: string;
  }>;
  orders: Array<{
    id: string;
    status: string;
    total: number;
    paymentMethod: string;
    createdAt: string;
  }>;
}

export interface CustomersSummary {
  totalCustomers: number;
  registeredCustomers: number;
  guestCustomers: number;
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
 * Retrieves and aggregates customer profiles dynamically from D1 with registered/guest filtering
 */
export async function getCustomers(options?: {
  search?: string;
  type?: "all" | "registered" | "guest";
  limit?: number;
  page?: number;
}): Promise<GetCustomersResult> {
  const db = getDb();
  let registeredList: Array<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    status: "active" | "suspended";
    createdAt: string;
  }> = [];

  let allOrders: Array<{
    id: string;
    customerId: string | null;
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
      const [custRows, orderRows] = await Promise.all([
        db
          .select({
            id: customers.id,
            email: customers.email,
            name: customers.name,
            phone: customers.phone,
            status: customers.status,
            createdAt: customers.createdAt,
          })
          .from(customers)
          .orderBy(desc(customers.createdAt)),
        db
          .select({
            id: orders.id,
            customerId: orders.customerId,
            customerName: orders.customerName,
            phone: orders.phone,
            email: orders.email,
            address: orders.address,
            city: orders.city,
            total: orders.total,
            createdAt: orders.createdAt,
          })
          .from(orders)
          .orderBy(desc(orders.createdAt)),
      ]);

      registeredList = custRows as unknown as typeof registeredList;
      allOrders = orderRows;
    } catch (err) {
      console.warn("[Customers] D1 query failed:", err);
    }
  }

  // 1. Map registered customers
  const customerMap = new Map<string, CustomerRecord>();
  const emailToRegisteredId = new Map<string, string>();

  for (const reg of registeredList) {
    const normEmail = reg.email.toLowerCase().trim();
    emailToRegisteredId.set(normEmail, reg.id);
    const key = `registered:${reg.id}`;

    customerMap.set(key, {
      id: reg.id,
      name: reg.name,
      email: reg.email,
      phone: reg.phone || "",
      address: "",
      city: "",
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: reg.createdAt,
      orderIds: [],
      isRegistered: true,
      status: reg.status || "active",
      registeredCustomerId: reg.id,
    });
  }

  // 2. Aggregate orders
  for (const o of allOrders) {
    const oEmail = (o.email || "").toLowerCase().trim();
    let regId = o.customerId || (oEmail ? emailToRegisteredId.get(oEmail) : undefined);

    if (regId && customerMap.has(`registered:${regId}`)) {
      const existing = customerMap.get(`registered:${regId}`)!;
      existing.totalOrders += 1;
      existing.totalSpent = Number((existing.totalSpent + (Number(o.total) || 0)).toFixed(2));
      existing.orderIds.push(o.id);
      if (!existing.address && o.address) existing.address = o.address;
      if (!existing.city && o.city) existing.city = o.city;
      if (!existing.phone && o.phone) existing.phone = o.phone;
      if (new Date(o.createdAt).getTime() > new Date(existing.lastOrderDate).getTime()) {
        existing.lastOrderDate = o.createdAt;
      }
    } else {
      // Guest order
      const guestKey = `guest:${normalizeCustomerKey(o.email, o.phone)}`;
      const existing = customerMap.get(guestKey);

      if (!existing) {
        customerMap.set(guestKey, {
          id: o.id,
          name: o.customerName || "Guest Customer",
          email: o.email || null,
          phone: o.phone || "",
          address: o.address || "",
          city: o.city || "",
          totalOrders: 1,
          totalSpent: Number(o.total) || 0,
          lastOrderDate: o.createdAt,
          orderIds: [o.id],
          isRegistered: false,
          status: "active",
        });
      } else {
        existing.totalOrders += 1;
        existing.totalSpent = Number((existing.totalSpent + (Number(o.total) || 0)).toFixed(2));
        existing.orderIds.push(o.id);
        if (!existing.email && o.email) existing.email = o.email;
        if (!existing.address && o.address) existing.address = o.address;
        if (!existing.city && o.city) existing.city = o.city;
        if (new Date(o.createdAt).getTime() > new Date(existing.lastOrderDate).getTime()) {
          existing.lastOrderDate = o.createdAt;
        }
      }
    }
  }

  let customerList = Array.from(customerMap.values());

  // Global counts for summary
  const totalRegistered = customerList.filter((c) => c.isRegistered).length;
  const totalGuest = customerList.filter((c) => !c.isRegistered).length;
  const totalRevenue = customerList.reduce((acc, c) => acc + c.totalSpent, 0);
  const totalOrdersCount = customerList.reduce((acc, c) => acc + c.totalOrders, 0);
  const averageOrderValue =
    totalOrdersCount > 0 ? Number((totalRevenue / totalOrdersCount).toFixed(2)) : 0;

  // Filter by Type (all / registered / guest)
  const filterType = options?.type || "all";
  if (filterType === "registered") {
    customerList = customerList.filter((c) => c.isRegistered);
  } else if (filterType === "guest") {
    customerList = customerList.filter((c) => !c.isRegistered);
  }

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

  const total = customerList.length;
  const limit = options?.limit && options.limit > 0 ? options.limit : 20;
  const page = options?.page && options.page > 0 ? options.page : 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const paginatedList = customerList.slice(offset, offset + limit);

  return {
    customers: paginatedList,
    summary: {
      totalCustomers: customerMap.size,
      registeredCustomers: totalRegistered,
      guestCustomers: totalGuest,
      totalOrders: totalOrdersCount,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      averageOrderValue,
    },
    total,
    totalPages,
    page,
  };
}

/**
 * Fetch deep customer details for admin inspection modal
 */
export async function getAdminCustomerDetail(customerId: string): Promise<CustomerDetailRecord | null> {
  const db = getDb();
  if (!db) return null;

  // 1. Check if registered customer
  const regCustomer = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);

  if (regCustomer.length > 0) {
    const cust = regCustomer[0];
    const normEmail = cust.email.toLowerCase().trim();

    const [addresses, revs, ords] = await Promise.all([
      db.select().from(customerAddresses).where(eq(customerAddresses.customerId, cust.id)),
      db
        .select({
          id: reviews.id,
          productId: reviews.productId,
          rating: reviews.rating,
          title: reviews.title,
          content: reviews.content,
          status: reviews.status,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .where(
          or(
            eq(reviews.customerId, cust.id),
            sql`LOWER(${reviews.customerEmail}) = ${normEmail}`
          )
        ),
      db
        .select({
          id: orders.id,
          status: orders.status,
          total: orders.total,
          paymentMethod: orders.paymentMethod,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(
          or(
            eq(orders.customerId, cust.id),
            sql`LOWER(${orders.email}) = ${normEmail}`
          )
        )
        .orderBy(desc(orders.createdAt)),
    ]);

    const totalSpent = ords.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

    return {
      id: cust.id,
      name: cust.name,
      email: cust.email,
      phone: cust.phone || defaultAddr?.phone || "",
      address: defaultAddr?.address || "",
      city: defaultAddr?.city || "",
      totalOrders: ords.length,
      totalSpent: Number(totalSpent.toFixed(2)),
      lastOrderDate: ords[0]?.createdAt || cust.createdAt,
      orderIds: ords.map((o) => o.id),
      isRegistered: true,
      status: cust.status || "active",
      registeredCustomerId: cust.id,
      addresses,
      reviews: revs,
      orders: ords,
    };
  }

  // 2. Otherwise try to find by order ID (guest)
  const guestOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.id, customerId))
    .limit(1);

  if (guestOrder.length > 0) {
    const o = guestOrder[0];
    const normEmail = (o.email || "").toLowerCase().trim();

    const relatedOrders = normEmail
      ? await db
          .select({
            id: orders.id,
            status: orders.status,
            total: orders.total,
            paymentMethod: orders.paymentMethod,
            createdAt: orders.createdAt,
          })
          .from(orders)
          .where(sql`LOWER(${orders.email}) = ${normEmail}`)
          .orderBy(desc(orders.createdAt))
      : [
          {
            id: o.id,
            status: o.status,
            total: o.total,
            paymentMethod: o.paymentMethod,
            createdAt: o.createdAt,
          },
        ];

    const totalSpent = relatedOrders.reduce((acc, ro) => acc + (Number(ro.total) || 0), 0);

    return {
      id: o.id,
      name: o.customerName || "Guest Customer",
      email: o.email || null,
      phone: o.phone || "",
      address: o.address || "",
      city: o.city || "",
      totalOrders: relatedOrders.length,
      totalSpent: Number(totalSpent.toFixed(2)),
      lastOrderDate: relatedOrders[0]?.createdAt || o.createdAt,
      orderIds: relatedOrders.map((ro) => ro.id),
      isRegistered: false,
      status: "active",
      addresses: [
        {
          id: `addr-${o.id}`,
          label: "Order Address",
          fullName: o.customerName,
          phone: o.phone,
          address: o.address,
          city: o.city,
          country: "Pakistan",
          postalCode: null,
          isDefault: true,
        },
      ],
      reviews: [],
      orders: relatedOrders,
    };
  }

  return null;
}
