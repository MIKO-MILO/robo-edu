import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { landingFeaturedVouchers } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/landing-config/vouchers/:id
// Hapus voucher dari featured (sama efeknya dengan toggle off).
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const [existing] = await db
    .select({ id: landingFeaturedVouchers.id })
    .from(landingFeaturedVouchers)
    .where(eq(landingFeaturedVouchers.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Featured voucher tidak ditemukan." },
      { status: 404 },
    );
  }

  await db
    .delete(landingFeaturedVouchers)
    .where(eq(landingFeaturedVouchers.id, id));

  return NextResponse.json({ success: true });
}
