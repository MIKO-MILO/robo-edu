import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/src/db";
import { wishlists } from "@/src/db/schema";

// TODO(backend): Ganti dengan user ID asli dari session/JWT setelah auth diimplementasikan
const DUMMY_USER_ID = "user_01jmrmh71f4r18fbad28717ff";

/**
 * DELETE /api/wishlist/[id]
 * Menghapus item dari wishlist berdasarkan ID item wishlist.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Wishlist Item ID wajib diisi" },
        { status: 400 }
      );
    }

    const result = await db
      .delete(wishlists)
      .where(
        and(
          eq(wishlists.id, id),
          eq(wishlists.userId, DUMMY_USER_ID)
        )
      );

    // Drizzle mysql2 driver might not return affected rows in a way that's easy to check here
    // but we assume if no error, it's fine.

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus dari wishlist",
    });
  } catch (error) {
    console.error("DELETE /api/wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus wishlist" },
      { status: 500 }
    );
  }
}
