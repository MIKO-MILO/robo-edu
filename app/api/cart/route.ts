import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/src/db";
import {
  carts,
  cartItems,
  products,
  productVariants,
  productImages,
} from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import crypto from "node:crypto";

export const runtime = "nodejs";

/**
 * Ensures the authenticated user has exactly one cart row.
 * Uses INSERT ... ON DUPLICATE KEY UPDATE to avoid a race condition
 * between two concurrent requests both trying to create the first cart.
 */
async function getOrCreateCart(userId: string) {
  const cartId = crypto.randomUUID();

  // Atomically insert or do nothing on duplicate userId.
  // The `id` column is only set on the very first insert.
  await db
    .insert(carts)
    .values({ id: cartId, userId })
    .onDuplicateKeyUpdate({ set: { userId } }); // no-op update, just avoids the error

  // Always re-read so we get the real id (which may differ from cartId if the
  // row already existed before our insert above).
  const [existing] = await db
    .select({ id: carts.id, userId: carts.userId })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  return existing!;
}

/**
 * GET /api/cart
 * Returns the authenticated user's cart items.
 */
export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const userCart = await getOrCreateCart(userId);

    const items = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        productName: products.name,
        productSlug: products.slug,
        variantName: productVariants.variantName,
        price: sql<number>`CAST(${productVariants.price} AS DECIMAL(15,2))`,
        stock: productVariants.stock,
        imageUrl: sql<string | null>`MAX(
          CASE
            WHEN ${productImages.isPrimary} = true THEN ${productImages.imageUrl}
            ELSE ${productImages.imageUrl}
          END
        )`,
        createdAt: cartItems.createdAt,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .leftJoin(productImages, eq(cartItems.productId, productImages.productId))
      .where(eq(cartItems.cartId, userCart.id))
      .groupBy(
        cartItems.id,
        cartItems.cartId,
        cartItems.productId,
        cartItems.variantId,
        cartItems.quantity,
        products.name,
        products.slug,
        productVariants.variantName,
        productVariants.price,
        productVariants.stock,
        cartItems.createdAt,
      )
      .orderBy(cartItems.createdAt);

    const formattedItems = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.productName,
      slug: item.productSlug,
      variantName: item.variantName,
      price: Number(item.price) || 0,
      quantity: item.quantity,
      stock: item.stock,
      imageUrl: item.imageUrl ?? "/images/placeholder-product.jpg",
      subtotal: (Number(item.price) || 0) * item.quantity,
    }));

    const totalItems = formattedItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const subtotal = formattedItems.reduce((acc, curr) => acc + curr.subtotal, 0);

    return NextResponse.json({
      success: true,
      data: { cartId: userCart.id, items: formattedItems, totalItems, subtotal },
    });
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data keranjang" }, { status: 500 });
  }
}

/**
 * POST /api/cart
 * Adds or increments an item in the authenticated user's cart.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const body = await request.json();
    const { productId, variantId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID wajib diisi" }, { status: 400 });
    }

    const qtyToAdd = Math.max(1, Number(quantity) || 1);

    let selectedVariantId = variantId;
    if (!selectedVariantId) {
      const variants = await db
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.productId, productId))
        .limit(1);

      if (variants.length === 0) {
        return NextResponse.json({ success: false, message: "Produk belum memiliki varian harga" }, { status: 404 });
      }
      selectedVariantId = variants[0].id;
    }

    const userCart = await getOrCreateCart(userId);

    const existingItem = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, userCart.id), eq(cartItems.variantId, selectedVariantId)))
      .limit(1);

    if (existingItem.length > 0) {
      const newQty = existingItem[0].quantity + qtyToAdd;
      await db.update(cartItems).set({ quantity: newQty }).where(eq(cartItems.id, existingItem[0].id));
      return NextResponse.json({
        success: true,
        message: "Jumlah produk di keranjang diperbarui",
        data: { id: existingItem[0].id, quantity: newQty },
      });
    }

    const newItemId = crypto.randomUUID();
    await db.insert(cartItems).values({
      id: newItemId,
      cartId: userCart.id,
      productId,
      variantId: selectedVariantId,
      quantity: qtyToAdd,
    });

    return NextResponse.json(
      { success: true, message: "Produk berhasil ditambahkan ke keranjang", data: { id: newItemId, quantity: qtyToAdd } },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ success: false, message: "Gagal menambahkan produk ke keranjang" }, { status: 500 });
  }
}
