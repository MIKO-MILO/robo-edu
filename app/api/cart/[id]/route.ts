import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/src/db";
import { cartItems, carts } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/** Resolves a cart item ID to the owning user ID for ownership verification. */
async function getCartItemOwner(itemId: string): Promise<string | null> {
  const [row] = await db
    .select({ userId: carts.userId })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .where(eq(cartItems.id, itemId))
    .limit(1);
  return row?.userId ?? null;
}

/**
 * PATCH /api/cart/[id]
 * Updates the quantity of a cart item. Only the item's owner may do this.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const newQty = Number(body.quantity);

    if (isNaN(newQty) || newQty < 1) {
      return NextResponse.json({ success: false, message: "Jumlah minimal adalah 1" }, { status: 400 });
    }

    const ownerUserId = await getCartItemOwner(id);
    if (!ownerUserId) {
      return NextResponse.json({ success: false, message: "Item tidak ditemukan" }, { status: 404 });
    }
    if (ownerUserId !== userId) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }

    await db.update(cartItems).set({ quantity: newQty }).where(eq(cartItems.id, id));

    return NextResponse.json({ success: true, message: "Jumlah produk berhasil diubah", data: { id, quantity: newQty } });
  } catch (error) {
    console.error("PATCH /api/cart/[id] error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengubah jumlah produk" }, { status: 500 });
  }
}

/**
 * DELETE /api/cart/[id]
 * Removes an item from the cart. Only the item's owner may do this.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { id } = await params;

    const ownerUserId = await getCartItemOwner(id);
    if (!ownerUserId) {
      return NextResponse.json({ success: false, message: "Item tidak ditemukan" }, { status: 404 });
    }
    if (ownerUserId !== userId) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }

    await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(carts.userId, userId)));

    return NextResponse.json({ success: true, message: "Item berhasil dihapus dari keranjang" });
  } catch (error) {
    console.error("DELETE /api/cart/[id] error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus item dari keranjang" }, { status: 500 });
  }
}
