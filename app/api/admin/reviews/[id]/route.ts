import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { reviews, users, products, orderItems, orders, reviewImages } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export const runtime = "nodejs";

/**
 * GET /api/admin/reviews/[id]
 * Ambil data review lengkap dengan join ke order items, order, produk, dan user.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const [row] = await db
    .select({
      id:            reviews.id,
      orderItemId:   reviews.orderItemId,
      productId:     reviews.productId,
      userId:        reviews.userId,
      rating:        reviews.rating,
      comment:       reviews.comment,
      status:        reviews.status,
      createdAt:     reviews.createdAt,
      updatedAt:     reviews.updatedAt,
      productName:   products.name,
      userName:      users.name,
      userEmail:     users.email,
      orderNumber:   orders.orderNumber,
    })
    .from(reviews)
    .innerJoin(products,    eq(reviews.productId,       products.id))
    .innerJoin(users,       eq(reviews.userId,          users.id))
    .innerJoin(orderItems,  eq(reviews.orderItemId,     orderItems.id))
    .innerJoin(orders,      eq(orderItems.orderId,      orders.id))
    .where(eq(reviews.id, id))
    .limit(1);

  if (!row) {
    return NextResponse.json({ success: false, message: "Review tidak ditemukan." }, { status: 404 });
  }

  const imageRows = await db
    .select({ id: reviewImages.id, url: reviewImages.url })
    .from(reviewImages)
    .where(eq(reviewImages.reviewId, id));

  return NextResponse.json({
    success: true,
    data: {
      id:            row.id,
      order_item_id: row.orderItemId,
      product_id:    row.productId,
      user_id:       row.userId,
      rating:        row.rating,
      comment:       row.comment ?? null,
      status:        row.status,
      created_at:    row.createdAt.toISOString(),
      updated_at:    row.updatedAt.toISOString(),
      product_name:  row.productName,
      user_name:     row.userName,
      user_email:    row.userEmail,
      order_number:  row.orderNumber,
      images:        imageRows.map((img) => ({ id: img.id, url: img.url })),
    },
  });
}

/**
 * DELETE /api/admin/reviews/[id]
 * Hapus review secara permanen.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const [review] = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.id, id)).limit(1);
  if (!review) {
    return NextResponse.json({ success: false, message: "Review tidak ditemukan." }, { status: 404 });
  }

  await db.delete(reviews).where(eq(reviews.id, id));

  return NextResponse.json({ success: true, message: "Review berhasil dihapus." });
}
