import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/src/db";
import {
  products,
  categories,
  productTypes,
  productVariants,
  productImages,
} from "@/src/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // =========================
    // Query Parameters
    // =========================
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const productType = searchParams.get("productType")?.trim() || "";

    const sort = searchParams.get("sort") || "newest";

    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10),
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(searchParams.get("limit") || "12", 10),
        1
      ),
      100
    );

    const offset = (page - 1) * limit;

    // =========================
    // Filter
    // =========================
    const filters = [
      eq(products.status, "active"),
      eq(categories.isActive, true),
      eq(productTypes.isActive, true),
    ];

    // Search nama / SKU
    if (search) {
      filters.push(
        or(
          like(products.name, `%${search}%`),
          like(products.sku, `%${search}%`)
        )!
      );
    }

    // Filter kategori berdasarkan slug
    if (category) {
      filters.push(eq(categories.slug, category));
    }

    // Filter product type berdasarkan slug
    if (productType) {
      filters.push(eq(productTypes.slug, productType));
    }

    // =========================
    // Sorting
    // =========================
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

    // =========================
    // Total Products
    // =========================
    const [totalResult] = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${products.id})`,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(
        productTypes,
        eq(products.productTypeId, productTypes.id)
      )
      .leftJoin(
        productVariants,
        eq(products.id, productVariants.productId)
      )
      .where(and(...filters));

    const total = Number(totalResult?.count || 0);
    const totalPages = Math.ceil(total / limit);

    // =========================
    // Products
    // =========================
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
          CASE
            WHEN ${productVariants.status} = 'active'
            THEN ${productVariants.price}
          END
        )`,

        maxPrice: sql<string | null>`MAX(
          CASE
            WHEN ${productVariants.status} = 'active'
            THEN ${productVariants.price}
          END
        )`,

        totalStock: sql<number>`COALESCE(
          SUM(
            CASE
              WHEN ${productVariants.status} = 'active'
              THEN ${productVariants.stock}
              ELSE 0
            END
          ),
          0
        )`,

        primaryImage: sql<string | null>`MAX(
          CASE
            WHEN ${productImages.isPrimary} = true
            THEN ${productImages.imageUrl}
          END
        )`,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(
        productTypes,
        eq(products.productTypeId, productTypes.id)
      )
      .leftJoin(
        productVariants,
        eq(products.id, productVariants.productId)
      )
      .leftJoin(
        productImages,
        and(
          eq(products.id, productImages.productId),
          eq(productImages.variantId, sql`${productImages.variantId}`)
        )
      )
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
        productTypes.slug
      )
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // =========================
    // Response
    // =========================
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
        min: product.minPrice
          ? Number(product.minPrice)
          : null,
        max: product.maxPrice
          ? Number(product.maxPrice)
          : null,
      },

      stock: Number(product.totalStock || 0),

      image: product.primaryImage,
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
      {
        success: false,
        message: "Gagal mengambil data produk",
      },
      { status: 500 }
    );
  }
}