import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { landingFeaturedVouchers, vouchers } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export const runtime = "nodejs";

/** Max featured vouchers di landing */
const MAX_FEATURED_VOUCHERS = 6;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/landing-config/vouchers
// Daftar voucher yang di-featured, diurutkan by sort_order, include data voucher.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const rows = await db
    .select({
      id:            landingFeaturedVouchers.id,
      voucherId:     landingFeaturedVouchers.voucherId,
      sortOrder:     landingFeaturedVouchers.sortOrder,
      createdAt:     landingFeaturedVouchers.createdAt,
      code:          vouchers.code,
      name:          vouchers.name,
      discountType:  vouchers.discountType,
      discountValue: vouchers.discountValue,
      minimumPurchase: vouchers.minimumPurchase,
      maximumDiscount: vouchers.maximumDiscount,
      startAt:       vouchers.startAt,
      endAt:         vouchers.endAt,
      isActive:      vouchers.isActive,
    })
    .from(landingFeaturedVouchers)
    .innerJoin(vouchers, eq(landingFeaturedVouchers.voucherId, vouchers.id))
    .orderBy(asc(landingFeaturedVouchers.sortOrder));

  const data = rows.map((r) => ({
    id:               r.id,
    voucher_id:       r.voucherId,
    sort_order:       r.sortOrder,
    created_at:       r.createdAt.toISOString(),
    voucher: {
      id:               r.voucherId,
      code:             r.code,
      name:             r.name,
      discount_type:    r.discountType,
      discount_value:   Number(r.discountValue),
      minimum_purchase: Number(r.minimumPurchase),
      maximum_discount: r.maximumDiscount !== null ? Number(r.maximumDiscount) : null,
      start_at:         r.startAt.toISOString(),
      end_at:           r.endAt.toISOString(),
      is_active:        r.isActive,
    },
  }));

  return NextResponse.json({ success: true, data });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/landing-config/vouchers
// Tambahkan voucher ke featured. Tolak jika sudah 6 baris aktif.
// Body: { voucher_id: string, sort_order?: number }
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid." },
      { status: 400 },
    );
  }

  const { voucher_id, sort_order } = (body ?? {}) as Record<string, unknown>;

  if (!voucher_id || typeof voucher_id !== "string") {
    return NextResponse.json(
      { success: false, message: "voucher_id wajib diisi." },
      { status: 422 },
    );
  }

  // Cek limit
  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(landingFeaturedVouchers);

  if (Number(count) >= MAX_FEATURED_VOUCHERS) {
    return NextResponse.json(
      {
        success: false,
        message: `Maksimum ${MAX_FEATURED_VOUCHERS} voucher dapat ditampilkan di landing page.`,
      },
      { status: 422 },
    );
  }

  // Cek voucher ada
  const [voucher] = await db
    .select({ id: vouchers.id })
    .from(vouchers)
    .where(eq(vouchers.id, voucher_id))
    .limit(1);

  if (!voucher) {
    return NextResponse.json(
      { success: false, message: "Voucher tidak ditemukan." },
      { status: 404 },
    );
  }

  // Cek duplikat
  const [dup] = await db
    .select({ id: landingFeaturedVouchers.id })
    .from(landingFeaturedVouchers)
    .where(eq(landingFeaturedVouchers.voucherId, voucher_id))
    .limit(1);

  if (dup) {
    return NextResponse.json(
      { success: false, message: "Voucher ini sudah ada di featured landing." },
      { status: 409 },
    );
  }

  const { randomUUID } = await import("node:crypto");
  const newId = randomUUID();

  // Hitung sort_order default = max + 1 jika tidak disediakan
  let resolvedSortOrder = typeof sort_order === "number" ? sort_order : 0;
  if (typeof sort_order !== "number") {
    const [{ maxOrder }] = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(sort_order), -1)` })
      .from(landingFeaturedVouchers);
    resolvedSortOrder = Number(maxOrder) + 1;
  }

  await db.insert(landingFeaturedVouchers).values({
    id:        newId,
    voucherId: voucher_id,
    sortOrder: resolvedSortOrder,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true, data: { id: newId } }, { status: 201 });
}
