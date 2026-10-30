import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { db } from "@/src/db";
import {
  products,
  categories,
  productTypes,
  productVariants,
  productImages,
} from "@/src/db/schema";
import { getUserIdFromRequest } from "@/src/lib/auth/session";
import { isActiveMember } from "@/src/lib/auth/membership";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // ─── Query Parameters ──────────────────────────────────────────────────
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const productType = searchParams.get("productType")?.trim() || "";
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10),
      1,
    );
    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || "12", 10), 1),
      100,
    );
    const offset = (page - 1) * limit;

    // ─── Member check ──────────────────────────────────────────────────────
    // Done before building queries so the DB hit happens once and the result
    // can be used both for the aggregate query and for shaping the response.
    const userId = getUserIdFromRequest(request);
    const memberPriceVisible = userId ? await isActiveMember(userId) : false;

    // ─── Filters ───────────────────────────────────────────────────────────
    const filters = [
      eq(products.status, "active"),
      eq(categories.isActive, true),
      eq(productTypes.isActive, true),
    ];

    if (search) {
      filters.push(
        or(like(products.name, `%${search}%`), like(products.sku, `%${search}%`))!,
      );
    }
    if (category) filters.push(eq(categories.slug, category));
    if (productType) filters.push(eq(productTypes.slug, productType));

    // ─── Sorting ───────────────────────────────────────────────────────────
    let orderBy;
    switch (sort) {
      case "price_asc":
        orderBy = asc(sql`MIN(${productVariants.price})`);
        break;
      case "price_desc":
        orderBy = desc(sql`MAX(${productVariants.price})`);
        break;
      case "name_asc":
        orderBy = asc(products.name);
        break;
      case "name_desc":
        orderBy = desc(products.name);
        break;
      case "oldest":
        orderBy = asc(products.createdAt);
        break;
      case "newest":
      default:
        orderBy = desc(products.createdAt);
        break;
    }

    // ─── Total count ───────────────────────────────────────────────────────
    const [totalResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${products.id})` })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(and(...filters));

    const total = Number(totalResult?.count || 0);
    const totalPages = Math.ceil(total / limit);

    // ─── Products (without images — to avoid GROUP BY complexity) ──────────
    const productRows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        description: products.description,
        status: products.status,

        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,

        productTypeId: productTypes.id,
        productTypeName: productTypes.name,
        productTypeSlug: productTypes.slug,

        minPrice: sql<string | null>`MIN(
          CASE WHEN ${productVariants.status} = 'active'
          THEN ${productVariants.price} END
        )`,
        maxPrice: sql<string | null>`MAX(
          CASE WHEN ${productVariants.status} = 'active'
          THEN ${productVariants.price} END
        )`,

        // Member price ranges — always fetched from DB; only surfaced in
        // the response when the caller is an active MEMBER.
        minMemberPrice: sql<string | null>`MIN(
          CASE WHEN ${productVariants.status} = 'active'
               AND ${productVariants.resellerPrice} IS NOT NULL
          THEN ${productVariants.resellerPrice} END
        )`,
        maxMemberPrice: sql<string | null>`MAX(
          CASE WHEN ${productVariants.status} = 'active'
               AND ${productVariants.resellerPrice} IS NOT NULL
          THEN ${productVariants.resellerPrice} END
        )`,

        totalStock: sql<number>`COALESCE(SUM(
          CASE WHEN ${productVariants.status} = 'active'
          THEN ${productVariants.stock} ELSE 0 END
        ), 0)`,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(and(...filters))
      .groupBy(
        products.id,
        products.name,
        products.slug,
        products.sku,
        products.description,
        products.status,
        products.createdAt,
        categories.id,
        categories.name,
        categories.slug,
        productTypes.id,
        productTypes.name,
        productTypes.slug,
      )
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // ─── Thumbnail images ──────────────────────────────────────────────────
    const productIds = productRows.map((r) => r.id);
    const imageMap: Record<string, string> = {};

    if (productIds.length > 0) {
      const imageRows = await db
        .select({
          productId: productImages.productId,
          imageUrl: productImages.imageUrl,
          isPrimary: productImages.isPrimary,
          sortOrder: productImages.sortOrder,
        })
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));

      for (const row of imageRows) {
        if (!imageMap[row.productId]) imageMap[row.productId] = row.imageUrl;
      }
    }

    // ─── Response ──────────────────────────────────────────────────────────
    const data = productRows.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,

      category: {
        id: product.categoryId,
        name: product.categoryName,
        slug: product.categorySlug,
      },
      productType: {
        id: product.productTypeId,
        name: product.productTypeName,
        slug: product.productTypeSlug,
      },

      price: {
        min: product.minPrice ? Number(product.minPrice) : null,
        max: product.maxPrice ? Number(product.maxPrice) : null,
        // Exposed only for active MEMBERs; null for guests and non-members.
        member_min:
          memberPriceVisible && product.minMemberPrice
            ? Number(product.minMemberPrice)
            : null,
        member_max:
          memberPriceVisible && product.maxMemberPrice
            ? Number(product.maxMemberPrice)
            : null,
      },

      stock: Number(product.totalStock || 0),
      image: imageMap[product.id] ?? null,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data produk" },
      { status: 500 },
    );
  }
}
