import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/src/db";
import { wishlists } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * DELETE /api/wishlist/[id]
 * Removes an item from the authenticated user's wishlist.
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

    if (!id) {
      return NextResponse.json({ success: false, message: "Wishlist Item ID wajib diisi" }, { status: 400 });
    }

    await db.delete(wishlists).where(and(eq(wishlists.id, id), eq(wishlists.userId, userId)));

    return NextResponse.json({ success: true, message: "Produk berhasil dihapus dari wishlist" });
  } catch (error) {
    console.error("DELETE /api/wishlist/[id] error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus wishlist" }, { status: 500 });
  }
}
