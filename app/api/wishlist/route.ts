import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/src/db";
import {
  wishlists,
  products,
  productImages,
  productVariants,
} from "@/src/db/schema";
import crypto from "node:crypto";

// TODO(backend): Ganti dengan user ID asli dari session/JWT setelah auth diimplementasikan
const DUMMY_USER_ID = "user_01jmrmh71f4r18fbad28717ff";

/**
 * GET /api/wishlist
 * Mengambil daftar wishlist milik user beserta info produk dasar.
 */
export async function GET() {
  try {
    const wishlistItems = await db
      .select({
        id: wishlists.id,
        product_id: products.id,
        product_name: products.name,
        product_slug: products.slug,
        base_price: sql<number>`CAST(MIN(${productVariants.price}) AS DECIMAL(12,2))`,
        image_url: sql<
          string | null
        >`MAX(CASE WHEN ${productImages.isPrimary} = true THEN ${productImages.imageUrl} END)`,
        in_stock: sql<boolean>`SUM(${productVariants.stock}) > 0`,
        created_at: wishlists.createdAt,
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .leftJoin(productImages, eq(products.id, productImages.productId))
      .where(eq(wishlists.userId, DUMMY_USER_ID))
      .groupBy(
        wishlists.id,
        products.id,
        products.name,
        products.slug,
        wishlists.createdAt,
      );

    return NextResponse.json({
      success: true,
      data: wishlistItems,
    });
  } catch (error) {
    console.error("GET /api/wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil wishlist" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/wishlist
 * Menambah produk ke wishlist.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json(
        { success: false, message: "Product ID wajib diisi" },
        { status: 400 },
      );
    }

    // Cek apakah sudah ada di wishlist
    const existing = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, DUMMY_USER_ID),
          eq(wishlists.productId, product_id),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Produk sudah ada di wishlist" },
        { status: 409 },
      );
    }

    const newWishlistItem = {
      id: crypto.randomUUID(),
      userId: DUMMY_USER_ID,
      productId: product_id,
    };

    await db.insert(wishlists).values(newWishlistItem);

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan ke wishlist",
        data: newWishlistItem,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah wishlist" },
      { status: 500 },
    );
  }
}
