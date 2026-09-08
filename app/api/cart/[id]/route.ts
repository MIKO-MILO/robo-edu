import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { cartItems } from "@/src/db/schema";

/**
 * PATCH /api/cart/[id]
 * Mengubah jumlah quantity item di keranjang.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Cart Item ID wajib diisi" },
        { status: 400 }
      );
    }

    const newQty = Number(quantity);
    if (isNaN(newQty) || newQty < 1) {
      return NextResponse.json(
        { success: false, message: "Jumlah minimal adalah 1" },
        { status: 400 }
      );
    }

    await db
      .update(cartItems)
      .set({ quantity: newQty })
      .where(eq(cartItems.id, id));

    return NextResponse.json({
      success: true,
      message: "Jumlah produk berhasil diubah",
      data: { id, quantity: newQty },
    });
  } catch (error) {
    console.error("PATCH /api/cart/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengubah jumlah produk" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/[id]
 * Menghapus item dari keranjang belanja.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Cart Item ID wajib diisi" },
        { status: 400 }
      );
    }

    await db.delete(cartItems).where(eq(cartItems.id, id));

    return NextResponse.json({
      success: true,
      message: "Item berhasil dihapus dari keranjang",
    });
  } catch (error) {
    console.error("DELETE /api/cart/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus item dari keranjang" },
      { status: 500 }
    );
  }
}
