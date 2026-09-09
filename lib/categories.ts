import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { getDb, categories } from "./db";

/**
 * ==============================================================================
 * Category Domain Types & Schemas
 * ==============================================================================
 */

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  status: "active" | "inactive" | "archived";
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithChildren extends CategoryRecord {
  children: CategoryWithChildren[];
  parentName?: string | null;
}

export interface FlattenedCategory extends CategoryRecord {
  depth: number;
  parentName?: string | null;
}

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(100, "Name cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120, "Slug cannot exceed 120 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens (e.g., 'summer-collection')"),
  description: z.string().trim().max(1000, "Description cannot exceed 1000 characters").optional().nullable().or(z.literal("")),
  parentId: z.string().trim().optional().nullable().or(z.literal("")),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        if (val.startsWith("/")) return true;
        try {
          const url = new URL(val);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Image URL must be a valid URL or relative media path (e.g., /api/media/...)" }
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  sortOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().trim().max(160, "SEO title cannot exceed 160 characters").optional().nullable().or(z.literal("")),
  seoDescription: z.string().trim().max(320, "SEO description cannot exceed 320 characters").optional().nullable().or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;

/**
 * Helper to convert arbitrary string into a URL-safe slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, "-") // replace spaces and underscores with single hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/**
 * ==============================================================================
 * Hierarchy & Tree Functions
 * ==============================================================================
 */

/**
 * Build a nested category tree from a flat list
 */
export function buildCategoryTree(items: CategoryRecord[]): CategoryWithChildren[] {
  const itemMap = new Map<string, CategoryWithChildren>();
  const roots: CategoryWithChildren[] = [];

  for (const item of items) {
    itemMap.set(item.id, { ...item, children: [] });
  }

  for (const item of items) {
    const node = itemMap.get(item.id)!;
    if (item.parentId && itemMap.has(item.parentId)) {
      const parent = itemMap.get(item.parentId)!;
      node.parentName = parent.name;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children recursively by sortOrder then name
  const sortNodes = (nodes: CategoryWithChildren[]) => {
    nodes.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    }
  };

  sortNodes(roots);
  return roots;
}

/**
 * Flatten a category tree into an ordered array with depth levels (for table rendering & selects)
 */
export function flattenCategoryHierarchy(
  tree: CategoryWithChildren[],
  depth = 0
): FlattenedCategory[] {
  const result: FlattenedCategory[] = [];

  for (const node of tree) {
    const { children, ...rest } = node;
    result.push({
      ...rest,
      depth,
    });
    if (children && children.length > 0) {
      result.push(...flattenCategoryHierarchy(children, depth + 1));
    }
  }

  return result;
}

/**
 * Collect all descendant IDs for a given category ID (to prevent circular references)
 */
export function getDescendantIds(items: CategoryRecord[], categoryId: string): Set<string> {
  const descendants = new Set<string>();
  const findChildren = (parentId: string) => {
    for (const item of items) {
      if (item.parentId === parentId) {
        descendants.add(item.id);
        findChildren(item.id);
      }
    }
  };
  findChildren(categoryId);
  return descendants;
}

/**
 * ==============================================================================
 * Database Operations (D1 + In-Memory Dev Fallback)
 * ==============================================================================
 */

// In-memory store for fallback during isolated unit tests or static environments
const memoryCategories: CategoryRecord[] = [];

/**
 * Retrieve all categories with optional status filter
 */
export async function listCategories(options?: {
  status?: "active" | "inactive" | "archived";
}): Promise<CategoryRecord[]> {
  const db = getDb();
  if (db) {
    try {
      if (options?.status) {
        const rows = await db
          .select()
          .from(categories)
          .where(eq(categories.status, options.status))
          .orderBy(asc(categories.sortOrder), asc(categories.name));
        return rows as CategoryRecord[];
      }
      const rows = await db
        .select()
        .from(categories)
        .orderBy(asc(categories.sortOrder), asc(categories.name));
      return rows as CategoryRecord[];
    } catch (err) {
      console.warn("[Categories] D1 query failed, using memory store:", err);
    }
  }

  let result = [...memoryCategories];
  if (options?.status) {
    result = result.filter((c) => c.status === options.status);
  }
  return result.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Retrieve active categories for storefront display
 */
export async function getActiveCategories(): Promise<CategoryRecord[]> {
  return listCategories({ status: "active" });
}

/**
 * Retrieve category by ID
 */
export async function getCategoryById(id: string): Promise<CategoryRecord | null> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);
      return (rows[0] as CategoryRecord) || null;
    } catch (err) {
      console.warn("[Categories] D1 getById failed:", err);
    }
  }

  return memoryCategories.find((c) => c.id === id) || null;
}

/**
 * Retrieve category by Slug
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryRecord | null> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);
      return (rows[0] as CategoryRecord) || null;
    } catch (err) {
      console.warn("[Categories] D1 getBySlug failed:", err);
    }
  }

  return memoryCategories.find((c) => c.slug === slug) || null;
}

/**
 * Create a new category
 */
export async function createCategory(input: CategoryInput): Promise<CategoryRecord> {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const record: CategoryRecord = {
    id,
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    parentId: input.parentId || null,
    imageUrl: input.imageUrl || null,
    sortOrder: input.sortOrder ?? 0,
    status: input.status ?? "active",
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    createdAt: now,
    updatedAt: now,
  };

  if (db) {
    await db.insert(categories).values({
      id: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description,
      parentId: record.parentId,
      imageUrl: record.imageUrl,
      sortOrder: record.sortOrder,
      status: record.status,
      seoTitle: record.seoTitle,
      seoDescription: record.seoDescription,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  // Update memory store as well
  memoryCategories.push(record);
  return record;
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>
): Promise<CategoryRecord | null> {
  const existing = await getCategoryById(id);
  if (!existing) return null;

  const db = getDb();
  const now = new Date().toISOString();

  const updatedRecord: CategoryRecord = {
    ...existing,
    name: input.name !== undefined ? input.name : existing.name,
    slug: input.slug !== undefined ? input.slug : existing.slug,
    description: input.description !== undefined ? (input.description || null) : existing.description,
    parentId: input.parentId !== undefined ? (input.parentId || null) : existing.parentId,
    imageUrl: input.imageUrl !== undefined ? (input.imageUrl || null) : existing.imageUrl,
    sortOrder: input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder,
    status: input.status !== undefined ? input.status : existing.status,
    seoTitle: input.seoTitle !== undefined ? (input.seoTitle || null) : existing.seoTitle,
    seoDescription: input.seoDescription !== undefined ? (input.seoDescription || null) : existing.seoDescription,
    updatedAt: now,
  };

  if (db) {
    await db
      .update(categories)
      .set({
        name: updatedRecord.name,
        slug: updatedRecord.slug,
        description: updatedRecord.description,
        parentId: updatedRecord.parentId,
        imageUrl: updatedRecord.imageUrl,
        sortOrder: updatedRecord.sortOrder,
        status: updatedRecord.status,
        seoTitle: updatedRecord.seoTitle,
        seoDescription: updatedRecord.seoDescription,
        updatedAt: updatedRecord.updatedAt,
      })
      .where(eq(categories.id, id));
  }

  const memIndex = memoryCategories.findIndex((c) => c.id === id);
  if (memIndex >= 0) {
    memoryCategories[memIndex] = updatedRecord;
  } else {
    memoryCategories.push(updatedRecord);
  }

  return updatedRecord;
}

/**
 * Delete a category.
 * If child categories exist, their parentId is reset to null (unlinked).
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const db = getDb();

  if (db) {
    try {
      // Unlink child categories
      await db
        .update(categories)
        .set({ parentId: null })
        .where(eq(categories.parentId, id));

      // Delete target category
      await db.delete(categories).where(eq(categories.id, id));
    } catch (err) {
      console.error("[Categories] Delete failed in D1:", err);
      return false;
    }
  }

  // Update memory store
  for (const item of memoryCategories) {
    if (item.parentId === id) {
      item.parentId = null;
    }
  }
  const index = memoryCategories.findIndex((c) => c.id === id);
  if (index >= 0) {
    memoryCategories.splice(index, 1);
  }

  return true;
}
