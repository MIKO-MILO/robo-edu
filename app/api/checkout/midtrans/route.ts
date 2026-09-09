import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { userAddresses } from "@/src/db/schema";
import { createPaymentTransaction } from "@/src/lib/services/transaction-service";
import { getSessionUserId } from "@/src/lib/auth/session";

/** Creates a Snap transaction and returns a Midtrans-hosted checkout URL. */
export async function POST() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    const [address] = await db
      .select({ id: userAddresses.id })
      .from(userAddresses)
      .where(and(eq(userAddresses.userId, userId), eq(userAddresses.isPrimary, true)))
      .orderBy(desc(userAddresses.updatedAt))
      .limit(1);

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Tambahkan dan pilih alamat utama sebelum melanjutkan pembayaran." },
        { status: 422 },
      );
    }

    const transaction = await createPaymentTransaction({
      userId,
      addressId: address.id,
      shippingCost: 0,
    });

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error("POST /api/checkout/midtrans error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Gagal membuat pembayaran Midtrans." },
      { status: 400 },
    );
  }
}
