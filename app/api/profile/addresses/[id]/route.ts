import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { userAddresses } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

async function requireUserId() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return userId;
}

/**
 * PATCH /api/profile/addresses/[id]
 * Updates an address. If isPrimary is set to true, the old primary is unset.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
  }

  try {
    const { id } = await params;
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

    await db.transaction(async (tx) => {
      // Verify address belongs to the current user
      const [existing] = await tx
        .select({ id: userAddresses.id })
        .from(userAddresses)
        .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
        .limit(1);

      if (!existing) {
        throw Object.assign(new Error("Alamat tidak ditemukan."), { status: 404 });
      }

      // Unset any current primary if we're setting this one as primary
      if (isPrimary) {
        await tx
          .update(userAddresses)
          .set({ isPrimary: false })
          .where(and(eq(userAddresses.userId, userId), eq(userAddresses.isPrimary, true)));
      }

      await tx
        .update(userAddresses)
        .set({
          label: label.trim(),
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          province: province.trim(),
          city: city.trim(),
          district: district.trim(),
          village: village.trim(),
          postalCode: postalCode.trim(),
          isPrimary: Boolean(isPrimary),
          updatedAt: new Date(),
        })
        .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)));
    });

    return NextResponse.json({ success: true, message: "Alamat berhasil diperbarui." });
  } catch (error) {
    console.error("PATCH /api/profile/addresses/[id] error:", error);
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Gagal memperbarui alamat.";
    return NextResponse.json({ success: false, message }, { status });
  }
}

/**
 * DELETE /api/profile/addresses/[id]
 * Deletes an address. If it was the primary address, the most recently
 * updated remaining address is promoted to primary automatically.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
  }

  try {
    const { id } = await params;

    await db.transaction(async (tx) => {
      const [target] = await tx
        .select({ id: userAddresses.id, isPrimary: userAddresses.isPrimary })
        .from(userAddresses)
        .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
        .limit(1);

      if (!target) {
        throw Object.assign(new Error("Alamat tidak ditemukan."), { status: 404 });
      }

      await tx
        .delete(userAddresses)
        .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)));

      // If we just deleted the primary address, promote the next one
      if (target.isPrimary) {
        const [next] = await tx
          .select({ id: userAddresses.id })
          .from(userAddresses)
          .where(eq(userAddresses.userId, userId))
          .orderBy(userAddresses.updatedAt)
          .limit(1);

        if (next) {
          await tx
            .update(userAddresses)
            .set({ isPrimary: true, updatedAt: new Date() })
            .where(eq(userAddresses.id, next.id));
        }
      }
    });

    return NextResponse.json({ success: true, message: "Alamat berhasil dihapus." });
  } catch (error) {
    console.error("DELETE /api/profile/addresses/[id] error:", error);
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Gagal menghapus alamat.";
    return NextResponse.json({ success: false, message }, { status });
  }
}

/**
 * POST /api/profile/addresses/[id]  (action: set-primary)
 * Sets a specific address as the primary/main address.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
  }

  try {
    const { id } = await params;

    await db.transaction(async (tx) => {
      const [target] = await tx
        .select({ id: userAddresses.id })
        .from(userAddresses)
        .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
        .limit(1);

      if (!target) {
        throw Object.assign(new Error("Alamat tidak ditemukan."), { status: 404 });
      }

      // Unset all primary for this user
      await tx
        .update(userAddresses)
        .set({ isPrimary: false })
        .where(and(eq(userAddresses.userId, userId), eq(userAddresses.isPrimary, true)));

      // Set the target as primary
      await tx
        .update(userAddresses)
        .set({ isPrimary: true, updatedAt: new Date() })
        .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)));
    });

    return NextResponse.json({ success: true, message: "Alamat utama berhasil diperbarui." });
  } catch (error) {
    console.error("POST /api/profile/addresses/[id] error:", error);
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Gagal mengatur alamat utama.";
    return NextResponse.json({ success: false, message }, { status });
  }
}
