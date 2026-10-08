import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import crypto from "node:crypto";
import { db } from "@/src/db";
import { vouchers } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatVoucher(v: typeof vouchers.$inferSelect) {
  return {
    id: v.id,
    code: v.code,
    name: v.name,
    description: v.description ?? null,
    discount_type: v.discountType,
    discount_value: Number(v.discountValue),
    minimum_purchase: v.minimumPurchase !== null ? Number(v.minimumPurchase) : null,
    maximum_discount: v.maximumDiscount !== null ? Number(v.maximumDiscount) : null,
    usage_limit: v.usageLimit ?? null,
    used_count: v.usedCount,
    start_at: v.startAt.toISOString(),
    end_at: v.endAt.toISOString(),
    is_active: v.isActive,
    created_at: v.createdAt.toISOString(),
    updated_at: v.updatedAt.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/vouchers
// Query params: search, is_active, page (default 1), limit (default 10, max 100)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim() ?? "";
  const isActiveParam = searchParams.get("is_active")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")));
  const offset = (page - 1) * limit;

  // ── Build where clause ───────────────────────────────────────────────
  const filters = [];

  if (isActiveParam === "true") {
    filters.push(eq(vouchers.isActive, true));
  } else if (isActiveParam === "false") {
    filters.push(eq(vouchers.isActive, false));
  }

  if (search) {
    const ql = `%${search}%`;
    filters.push(or(like(vouchers.code, ql), like(vouchers.name, ql))!);
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  // ── Count ────────────────────────────────────────────────────────────
  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(vouchers)
    .where(whereClause);

  const totalCount = Number(total);

  if (totalCount === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      meta: { page, limit, total: 0, total_pages: 0 },
    });
  }

  // ── Fetch ────────────────────────────────────────────────────────────
  const rows = await db
    .select()
    .from(vouchers)
    .where(whereClause)
    .orderBy(desc(vouchers.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({
    success: true,
    data: rows.map(formatVoucher),
    meta: {
      page,
      limit,
      total: totalCount,
      total_pages: Math.ceil(totalCount / limit),
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/vouchers
// Body: CreateVoucherRequestBody
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid." },
      { status: 400 },
    );
  }

  const {
    code,
    name,
    description,
    discount_type,
    discount_value,
    minimum_purchase,
    maximum_discount,
    usage_limit,
    start_at,
    end_at,
    is_active,
  } = body as Record<string, unknown>;

  // ── Validasi wajib ───────────────────────────────────────────────────
  const errors: string[] = [];

  if (typeof code !== "string" || !code.trim()) {
    errors.push("code wajib diisi.");
  }
  if (typeof name !== "string" || !name.trim()) {
    errors.push("name wajib diisi.");
  }
  if (discount_type !== "PERCENTAGE" && discount_type !== "FIXED_AMOUNT") {
    errors.push("discount_type harus 'PERCENTAGE' atau 'FIXED_AMOUNT'.");
  }
  const discountValueNum = Number(discount_value);
  if (!Number.isFinite(discountValueNum) || discountValueNum <= 0) {
    errors.push("discount_value harus angka positif.");
  }
  if (discount_type === "PERCENTAGE" && discountValueNum > 100) {
    errors.push("discount_value tidak boleh melebihi 100 untuk tipe PERCENTAGE.");
  }
  if (!start_at || isNaN(Date.parse(String(start_at)))) {
    errors.push("start_at harus berupa tanggal ISO yang valid.");
  }
  if (!end_at || isNaN(Date.parse(String(end_at)))) {
    errors.push("end_at harus berupa tanggal ISO yang valid.");
  }
  if (start_at && end_at && new Date(String(start_at)) >= new Date(String(end_at))) {
    errors.push("end_at harus setelah start_at.");
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { success: false, message: errors.join(" ") },
      { status: 422 },
    );
  }

  // ── Cek duplikat kode ────────────────────────────────────────────────
  const normalizedCode = String(code).trim().toUpperCase();
  const [existing] = await db
    .select({ id: vouchers.id })
    .from(vouchers)
    .where(eq(vouchers.code, normalizedCode))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { success: false, message: `Kode voucher '${normalizedCode}' sudah digunakan.` },
      { status: 409 },
    );
  }

  // ── Insert ───────────────────────────────────────────────────────────
  const id = crypto.randomUUID();
  const minPurchase =
    minimum_purchase !== undefined && minimum_purchase !== null
      ? String(Number(minimum_purchase))
      : "0";
  const maxDiscount =
    maximum_discount !== undefined && maximum_discount !== null
      ? String(Number(maximum_discount))
      : null;
  const usageLimitVal =
    usage_limit !== undefined && usage_limit !== null
      ? Math.floor(Number(usage_limit))
      : null;

  await db.insert(vouchers).values({
    id,
    code: normalizedCode,
    name: String(name).trim(),
    description:
      typeof description === "string" && description.trim()
        ? description.trim()
        : null,
    discountType: String(discount_type),
    discountValue: String(discountValueNum),
    minimumPurchase: minPurchase,
    maximumDiscount: maxDiscount,
    usageLimit: usageLimitVal,
    startAt: new Date(String(start_at)),
    endAt: new Date(String(end_at)),
    isActive: is_active === false ? false : true,
  });

  const [created] = await db
    .select()
    .from(vouchers)
    .where(eq(vouchers.id, id))
    .limit(1);

  return NextResponse.json(
    { success: true, data: formatVoucher(created!) },
    { status: 201 },
  );
}
