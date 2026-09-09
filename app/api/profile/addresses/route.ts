import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { userAddresses } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import crypto from "node:crypto";

export const runtime = "nodejs";

async function requireUserId() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return userId;
}

/**
 * GET /api/profile/addresses
 * Returns all addresses belonging to the authenticated user.
 */
export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
  }

  try {
    const addresses = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, userId))
      .orderBy(asc(userAddresses.createdAt));

    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    console.error("GET /api/profile/addresses error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil daftar alamat." }, { status: 500 });
  }
}

/**
 * POST /api/profile/addresses
 * Adds a new address for the authenticated user.
 * If is_primary is true, unsets the current primary address first.
 */
export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { label, recipientName, phone, address, province, city, district, village, postalCode, isPrimary } = body;

    if (
      !label?.trim() || !recipientName?.trim() || !phone?.trim() ||
      !address?.trim() || !province?.trim() || !city?.trim() ||
      !district?.trim() || !village?.trim() || !postalCode?.trim()
    ) {
      return NextResponse.json({ success: false, message: "Semua field alamat wajib diisi." }, { status: 400 });
    }

    if (label.length > 50 || recipientName.length > 150 || phone.length > 30 || postalCode.length > 10) {
      return NextResponse.json({ success: false, message: "Data alamat melebihi batas karakter yang diizinkan." }, { status: 400 });
    }

    const makePrimary = Boolean(isPrimary);

    await db.transaction(async (tx) => {
      // If this address will be primary, unset any existing primary first
      if (makePrimary) {
        await tx
          .update(userAddresses)
          .set({ isPrimary: false })
          .where(and(eq(userAddresses.userId, userId), eq(userAddresses.isPrimary, true)));
      }

      // Check if this is the first address — make it primary automatically
      const existing = await tx
        .select({ id: userAddresses.id })
        .from(userAddresses)
        .where(eq(userAddresses.userId, userId))
        .limit(1);

      const shouldBePrimary = makePrimary || existing.length === 0;

      await tx.insert(userAddresses).values({
        id: crypto.randomUUID(),
        userId,
        label: label.trim(),
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        province: province.trim(),
        city: city.trim(),
        district: district.trim(),
        village: village.trim(),
        postalCode: postalCode.trim(),
        isPrimary: shouldBePrimary,
      });
    });

    return NextResponse.json({ success: true, message: "Alamat berhasil ditambahkan." }, { status: 201 });
  } catch (error) {
    console.error("POST /api/profile/addresses error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan alamat." }, { status: 500 });
  }
}
