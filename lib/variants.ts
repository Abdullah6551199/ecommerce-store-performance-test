import { z } from "zod";
import { eq, and, desc, asc, inArray } from "drizzle-orm";
import { getDb, productVariants, products, attributes, attributeValues } from "./db";
import { generateSlug } from "./categories";

/**
 * ==============================================================================
 * Variant & Attribute Types
 * ==============================================================================
 */

export interface ProductVariantRecord {
  id: string;
  productId: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl: string | null;
  options: Record<string, string>;
  weight: number | null;
  dimensions: {
    length?: number | null;
    width?: number | null;
    height?: number | null;
    unit?: string | null;
  } | null;
  isDefault: boolean;
}

export interface AttributeRecord {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  values?: AttributeValueRecord[];
}

export interface AttributeValueRecord {
  id: string;
  attributeId: string;
  value: string;
  createdAt: string;
}

/**
 * Zod validation schemas
 */

export const variantInputSchema = z.object({
  id: z.string().optional(),
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(64, "SKU cannot exceed 64 characters")
    .regex(/^[A-Za-z0-9-_]+$/, "SKU may only contain letters, numbers, hyphens, and underscores"),
  price: z
    .union([z.coerce.number().positive("Price must be positive"), z.literal(""), z.null(), z.undefined()])
    .optional(),
  salePrice: z
    .union([z.coerce.number().positive("Sale price must be positive"), z.literal(""), z.null(), z.undefined()])
    .optional(),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative").default(0),
  imageUrl: z
    .union([z.string().trim().url("Variant image must be a valid URL"), z.literal(""), z.null(), z.undefined()])
    .optional(),
  options: z
    .record(z.string(), z.string())
    .refine((obj) => Object.keys(obj).length > 0, "Variant must have at least one option (e.g. Color, Size)"),
  weight: z
    .union([z.coerce.number().positive("Weight must be positive"), z.literal(""), z.null(), z.undefined()])
    .optional(),
  dimensions: z
    .object({
      length: z.coerce.number().optional().nullable(),
      width: z.coerce.number().optional().nullable(),
      height: z.coerce.number().optional().nullable(),
      unit: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  isDefault: z.boolean().default(false),
});

export type ProductVariantInput = z.infer<typeof variantInputSchema>;

export const bulkVariantsSchema = z.object({
  variants: z.array(variantInputSchema).min(1, "At least one variant combination must be provided"),
});

export const attributeInputSchema = z.object({
  name: z.string().trim().min(1, "Attribute name is required").max(50),
  values: z.array(z.string().trim().min(1)).min(1, "At least one attribute value is required"),
});

/**
 * In-memory fallback stores
 */
const memoryVariants: ProductVariantRecord[] = [];
const memoryAttributes: AttributeRecord[] = [];
const memoryAttributeValues: AttributeValueRecord[] = [];

/**
 * Format raw variant row from DB or memory
 */
function formatVariantRow(row: any): ProductVariantRecord {
  let opts: Record<string, string> = {};
  if (row.options) {
    try {
      opts = typeof row.options === "string" ? JSON.parse(row.options) : row.options;
    } catch {
      opts = {};
    }
  }

  let dims = null;
  if (row.dimensions) {
    try {
      dims = typeof row.dimensions === "string" ? JSON.parse(row.dimensions) : row.dimensions;
    } catch {
      dims = null;
    }
  }

  return {
    id: row.id,
    productId: row.productId || row.product_id,
    sku: row.sku,
    price: Number(row.price),
    salePrice: row.salePrice !== null && row.salePrice !== undefined && row.salePrice !== ""
      ? Number(row.salePrice)
      : (row.sale_price !== null && row.sale_price !== undefined ? Number(row.sale_price) : null),
    stock: Number(row.stock) || 0,
    imageUrl: row.imageUrl || row.image_url || null,
    options: opts,
    weight: row.weight ? Number(row.weight) : null,
    dimensions: dims,
    isDefault: Boolean(row.isDefault || row.is_default),
  };
}

/**
 * Check if variant SKU is already assigned to another variant or product
 */
export async function isVariantSkuTaken(sku: string, excludeVariantId?: string): Promise<boolean> {
  const normalized = sku.trim().toUpperCase();
  const db = getDb();

  if (db) {
    try {
      const rows = await db
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.sku, normalized));

      if (rows.length === 0) return false;
      if (excludeVariantId && rows.length === 1 && rows[0].id === excludeVariantId) return false;
      return true;
    } catch (err) {
      console.warn("[Variants] isVariantSkuTaken check failed in D1:", err);
    }
  }

  return memoryVariants.some((v) => v.sku === normalized && v.id !== excludeVariantId);
}

/**
 * Retrieve all variants for a given product ID
 */
export async function getVariantsByProductId(productId: string): Promise<ProductVariantRecord[]> {
  const db = getDb();

  if (db) {
    try {
      const rows = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, productId))
        .orderBy(desc(productVariants.isDefault), asc(productVariants.sku));

      return rows.map(formatVariantRow);
    } catch (err) {
      console.warn("[Variants] getVariantsByProductId D1 query failed, falling back to memory:", err);
    }
  }

  return memoryVariants
    .filter((v) => v.productId === productId)
    .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
}

/**
 * Bulk create or update variants for a product
 */
export async function saveProductVariants(
  productId: string,
  variantsInput: ProductVariantInput[],
  baseProductPrice?: number
): Promise<ProductVariantRecord[]> {
  const db = getDb();

  // 1. Fetch base product to get fallback price if not provided
  let fallbackPrice = baseProductPrice || 0;
  if (!baseProductPrice && db) {
    try {
      const pRow = await db
        .select({ price: products.price })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);
      if (pRow.length > 0) {
        fallbackPrice = Number(pRow[0].price);
      }
    } catch (err) {
      console.warn("[Variants] Could not fetch product price:", err);
    }
  }

  // 2. Validate internal SKU uniqueness in this submitted batch
  const skusInBatch = new Set<string>();
  for (const v of variantsInput) {
    const normSku = v.sku.trim().toUpperCase();
    if (skusInBatch.has(normSku)) {
      throw new Error(`Duplicate SKU '${v.sku}' detected within the variants list.`);
    }
    skusInBatch.add(normSku);
  }

  // 3. Ensure exactly one default variant
  let hasDefault = false;
  const processedVariants: ProductVariantRecord[] = variantsInput.map((v, idx) => {
    const isDef = Boolean(v.isDefault);
    let resolvedIsDefault = false;

    if (isDef && !hasDefault) {
      resolvedIsDefault = true;
      hasDefault = true;
    } else if (isDef && hasDefault) {
      // Multiple marked default, keep first
      resolvedIsDefault = false;
    }

    const priceVal = v.price !== undefined && v.price !== null && v.price !== "" && Number(v.price) > 0
      ? Number(v.price)
      : fallbackPrice;

    const salePriceVal = v.salePrice !== undefined && v.salePrice !== null && v.salePrice !== "" && Number(v.salePrice) > 0
      ? Number(v.salePrice)
      : null;

    return {
      id: v.id || crypto.randomUUID(),
      productId,
      sku: v.sku.trim().toUpperCase(),
      price: priceVal,
      salePrice: salePriceVal,
      stock: Number(v.stock) || 0,
      imageUrl: v.imageUrl && v.imageUrl.trim() ? v.imageUrl.trim() : null,
      options: v.options,
      weight: v.weight ? Number(v.weight) : null,
      dimensions: v.dimensions || null,
      isDefault: resolvedIsDefault,
    };
  });

  // If no variant was designated default, set the first one as default
  if (!hasDefault && processedVariants.length > 0) {
    processedVariants[0].isDefault = true;
  }

  // 4. Persist to Database or Memory
  if (db) {
    try {
      // Check existing variants in DB for this product
      const existingRows = await db
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.productId, productId));

      const existingIds = new Set(existingRows.map((r) => r.id));
      const incomingIds = new Set(processedVariants.map((v) => v.id));

      // Remove deleted variants
      for (const oldId of existingIds) {
        if (!incomingIds.has(oldId)) {
          await db.delete(productVariants).where(eq(productVariants.id, oldId));
        }
      }

      // Upsert incoming variants
      for (const v of processedVariants) {
        if (existingIds.has(v.id)) {
          await db
            .update(productVariants)
            .set({
              sku: v.sku,
              price: v.price,
              salePrice: v.salePrice,
              stock: v.stock,
              imageUrl: v.imageUrl,
              options: JSON.stringify(v.options) as any,
              weight: v.weight,
              dimensions: v.dimensions ? (JSON.stringify(v.dimensions) as any) : null,
              isDefault: v.isDefault,
            })
            .where(eq(productVariants.id, v.id));
        } else {
          await db.insert(productVariants).values({
            id: v.id,
            productId: v.productId,
            sku: v.sku,
            price: v.price,
            salePrice: v.salePrice,
            stock: v.stock,
            imageUrl: v.imageUrl,
            options: JSON.stringify(v.options) as any,
            weight: v.weight,
            dimensions: v.dimensions ? (JSON.stringify(v.dimensions) as any) : null,
            isDefault: v.isDefault,
          });
        }
      }

      return getVariantsByProductId(productId);
    } catch (err) {
      console.warn("[Variants] D1 saveProductVariants failed, falling back to memory:", err);
    }
  }

  // Memory fallback
  for (let i = memoryVariants.length - 1; i >= 0; i--) {
    if (memoryVariants[i].productId === productId) {
      memoryVariants.splice(i, 1);
    }
  }
  memoryVariants.push(...processedVariants);
  return [...processedVariants].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
}

/**
 * Delete a single variant by ID
 */
export async function deleteVariantById(variantId: string): Promise<boolean> {
  const db = getDb();

  if (db) {
    try {
      // Check if this variant was default
      const rows = await db
        .select({ productId: productVariants.productId, isDefault: productVariants.isDefault })
        .from(productVariants)
        .where(eq(productVariants.id, variantId))
        .limit(1);

      if (rows.length === 0) return false;
      const { productId, isDefault } = rows[0];

      await db.delete(productVariants).where(eq(productVariants.id, variantId));

      // If deleted variant was default, mark another remaining variant as default
      if (isDefault) {
        const remaining = await db
          .select({ id: productVariants.id })
          .from(productVariants)
          .where(eq(productVariants.productId, productId))
          .limit(1);

        if (remaining.length > 0) {
          await db
            .update(productVariants)
            .set({ isDefault: true })
            .where(eq(productVariants.id, remaining[0].id));
        }
      }

      return true;
    } catch (err) {
      console.error("[Variants] deleteVariantById failed in D1:", err);
      return false;
    }
  }

  // Memory fallback
  const idx = memoryVariants.findIndex((v) => v.id === variantId);
  if (idx >= 0) {
    const removed = memoryVariants.splice(idx, 1)[0];
    if (removed.isDefault) {
      const nextDef = memoryVariants.find((v) => v.productId === removed.productId);
      if (nextDef) nextDef.isDefault = true;
    }
    return true;
  }
  return false;
}

/**
 * ==============================================================================
 * Attributes Management
 * ==============================================================================
 */

/**
 * List all attributes with their values
 */
export async function listAttributes(): Promise<AttributeRecord[]> {
  const db = getDb();

  if (db) {
    try {
      const attrs = await db.select().from(attributes).orderBy(asc(attributes.name));
      if (attrs.length === 0) return [];

      const attrIds = attrs.map((a) => a.id);
      const vals = await db
        .select()
        .from(attributeValues)
        .where(inArray(attributeValues.attributeId, attrIds))
        .orderBy(asc(attributeValues.value));

      const valMap = new Map<string, AttributeValueRecord[]>();
      for (const v of vals) {
        if (!valMap.has(v.attributeId)) {
          valMap.set(v.attributeId, []);
        }
        valMap.get(v.attributeId)!.push(v as AttributeValueRecord);
      }

      return attrs.map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        createdAt: a.createdAt,
        values: valMap.get(a.id) || [],
      }));
    } catch (err) {
      console.warn("[Attributes] listAttributes D1 query failed, falling back to memory:", err);
    }
  }

  return memoryAttributes.map((a) => ({
    ...a,
    values: memoryAttributeValues.filter((v) => v.attributeId === a.id),
  }));
}

/**
 * Create or update attribute and its values
 */
export async function createOrUpdateAttribute(
  name: string,
  values: string[]
): Promise<AttributeRecord> {
  const db = getDb();
  const cleanName = name.trim();
  const slug = generateSlug(cleanName);
  const cleanValues = Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));

  if (cleanValues.length === 0) {
    throw new Error("Attribute must have at least one value.");
  }

  if (db) {
    try {
      // Check if attribute with slug already exists
      const existing = await db
        .select()
        .from(attributes)
        .where(eq(attributes.slug, slug))
        .limit(1);

      let attrId = existing.length > 0 ? existing[0].id : crypto.randomUUID();

      if (existing.length === 0) {
        await db.insert(attributes).values({
          id: attrId,
          name: cleanName,
          slug,
        });
      }

      // Add missing values
      const existingVals = await db
        .select()
        .from(attributeValues)
        .where(eq(attributeValues.attributeId, attrId));

      const existingValNames = new Set(existingVals.map((v) => v.value.toLowerCase()));

      for (const val of cleanValues) {
        if (!existingValNames.has(val.toLowerCase())) {
          await db.insert(attributeValues).values({
            id: crypto.randomUUID(),
            attributeId: attrId,
            value: val,
          });
        }
      }

      const allVals = await db
        .select()
        .from(attributeValues)
        .where(eq(attributeValues.attributeId, attrId));

      return {
        id: attrId,
        name: cleanName,
        slug,
        createdAt: existing.length > 0 ? existing[0].createdAt : new Date().toISOString(),
        values: allVals as AttributeValueRecord[],
      };
    } catch (err) {
      console.warn("[Attributes] createOrUpdateAttribute D1 failed, using memory:", err);
    }
  }

  // Memory fallback
  let attr = memoryAttributes.find((a) => a.slug === slug);
  if (!attr) {
    attr = {
      id: crypto.randomUUID(),
      name: cleanName,
      slug,
      createdAt: new Date().toISOString(),
    };
    memoryAttributes.push(attr);
  }

  const existingVals = memoryAttributeValues.filter((v) => v.attributeId === attr!.id);
  const existingValNames = new Set(existingVals.map((v) => v.value.toLowerCase()));

  for (const val of cleanValues) {
    if (!existingValNames.has(val.toLowerCase())) {
      memoryAttributeValues.push({
        id: crypto.randomUUID(),
        attributeId: attr.id,
        value: val,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return {
    ...attr,
    values: memoryAttributeValues.filter((v) => v.attributeId === attr!.id),
  };
}

/**
 * Delete an attribute by ID
 */
export async function deleteAttribute(id: string): Promise<boolean> {
  const db = getDb();

  if (db) {
    try {
      await db.delete(attributeValues).where(eq(attributeValues.attributeId, id));
      await db.delete(attributes).where(eq(attributes.id, id));
      return true;
    } catch (err) {
      console.error("[Attributes] deleteAttribute failed in D1:", err);
      return false;
    }
  }

  // Memory fallback
  for (let i = memoryAttributeValues.length - 1; i >= 0; i--) {
    if (memoryAttributeValues[i].attributeId === id) {
      memoryAttributeValues.splice(i, 1);
    }
  }
  const idx = memoryAttributes.findIndex((a) => a.id === id);
  if (idx >= 0) {
    memoryAttributes.splice(idx, 1);
    return true;
  }
  return false;
}
