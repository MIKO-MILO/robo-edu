import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { vouchers, voucherUsages } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// Helper
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

type RouteContext = { params: Promise<{ id: string }> };

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/vouchers/[id]
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  const [voucher] = await db
    .select()
    .from(vouchers)
    .where(eq(vouchers.id, id))
    .limit(1);

  if (!voucher) {
    return NextResponse.json(
      { success: false, message: "Voucher tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: formatVoucher(voucher) });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/vouchers/[id]
// Body: UpdateVoucherRequestBody (semua field opsional)
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  // Cek voucher ada
  const [existing] = await db
    .select()
    .from(vouchers)
    .where(eq(vouchers.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Voucher tidak ditemukan." },
      { status: 404 },
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

  // ── Validasi field yang dikirim ──────────────────────────────────────
  const errors: string[] = [];
  const updates: Partial<typeof vouchers.$inferInsert> = {};

  if (code !== undefined) {
    if (typeof code !== "string" || !code.trim()) {
      errors.push("code tidak boleh kosong.");
    } else {
      const normalized = code.trim().toUpperCase();
      // Cek duplikat kode (kecuali milik voucher ini sendiri)
      const [dup] = await db
        .select({ id: vouchers.id })
        .from(vouchers)
        .where(eq(vouchers.code, normalized))
        .limit(1);
      if (dup && dup.id !== id) {
        errors.push(`Kode voucher '${normalized}' sudah digunakan oleh voucher lain.`);
      } else {
        updates.code = normalized;
      }
    }
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      errors.push("name tidak boleh kosong.");
    } else {
      updates.name = name.trim();
    }
  }

  if (description !== undefined) {
    updates.description =
      typeof description === "string" && description.trim()
        ? description.trim()
        : null;
  }

  const resolvedDiscountType =
    discount_type !== undefined ? String(discount_type) : existing.discountType;

  if (discount_type !== undefined) {
    if (discount_type !== "PERCENTAGE" && discount_type !== "FIXED_AMOUNT") {
      errors.push("discount_type harus 'PERCENTAGE' atau 'FIXED_AMOUNT'.");
    } else {
      updates.discountType = String(discount_type);
    }
  }

  if (discount_value !== undefined) {
    const v = Number(discount_value);
    if (!Number.isFinite(v) || v <= 0) {
      errors.push("discount_value harus angka positif.");
    } else if (resolvedDiscountType === "PERCENTAGE" && v > 100) {
      errors.push("discount_value tidak boleh melebihi 100 untuk tipe PERCENTAGE.");
    } else {
      updates.discountValue = String(v);
    }
  }

  if (minimum_purchase !== undefined) {
    updates.minimumPurchase =
      minimum_purchase !== null ? String(Number(minimum_purchase)) : "0";
  }

  if (maximum_discount !== undefined) {
    updates.maximumDiscount =
      maximum_discount !== null ? String(Number(maximum_discount)) : null;
  }

  if (usage_limit !== undefined) {
    updates.usageLimit =
      usage_limit !== null ? Math.floor(Number(usage_limit)) : null;
  }

  const resolvedStartAt =
    start_at !== undefined ? new Date(String(start_at)) : existing.startAt;
  const resolvedEndAt =
    end_at !== undefined ? new Date(String(end_at)) : existing.endAt;

  if (start_at !== undefined) {
    if (isNaN(resolvedStartAt.getTime())) {
      errors.push("start_at harus berupa tanggal ISO yang valid.");
    } else {
      updates.startAt = resolvedStartAt;
    }
  }

  if (end_at !== undefined) {
    if (isNaN(resolvedEndAt.getTime())) {
      errors.push("end_at harus berupa tanggal ISO yang valid.");
    } else {
      updates.endAt = resolvedEndAt;
    }
  }

  if (
    !errors.length &&
    resolvedStartAt >= resolvedEndAt
  ) {
    errors.push("end_at harus setelah start_at.");
  }

  if (is_active !== undefined) {
    updates.isActive = Boolean(is_active);
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { success: false, message: errors.join(" ") },
      { status: 422 },
    );
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { success: false, message: "Tidak ada field yang diperbarui." },
      { status: 400 },
    );
  }

  // ── Update ───────────────────────────────────────────────────────────
  updates.updatedAt = new Date();

  await db.update(vouchers).set(updates).where(eq(vouchers.id, id));

  const [updated] = await db
    .select()
    .from(vouchers)
    .where(eq(vouchers.id, id))
    .limit(1);

  return NextResponse.json({ success: true, data: formatVoucher(updated!) });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/vouchers/[id]
//
// Soft-delete: set isActive = false jika voucher sudah pernah dipakai
// (ada voucherUsages) sehingga referential integrity tetap terjaga.
// Hard-delete: hapus jika belum pernah dipakai sama sekali.
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  const [voucher] = await db
    .select()
    .from(vouchers)
    .where(eq(vouchers.id, id))
    .limit(1);

  if (!voucher) {
    return NextResponse.json(
      { success: false, message: "Voucher tidak ditemukan." },
      { status: 404 },
    );
  }

  // Cek apakah voucher sudah pernah dipakai
  const [{ usageCount }] = await db
    .select({ usageCount: sql<number>`COUNT(*)` })
    .from(voucherUsages)
    .where(eq(voucherUsages.voucherId, id));

  if (Number(usageCount) > 0) {
    // Soft-delete: nonaktifkan saja agar histori order tetap valid
    await db
      .update(vouchers)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(vouchers.id, id));

    return NextResponse.json({
      success: true,
      data: { message: "Voucher telah dinonaktifkan karena sudah pernah digunakan. Data histori tetap tersimpan." },
    });
  }

  // Hard-delete: belum pernah dipakai, aman dihapus
  await db.delete(vouchers).where(eq(vouchers.id, id));

  return NextResponse.json({
    success: true,
    data: { message: "Voucher berhasil dihapus." },
  });
}
