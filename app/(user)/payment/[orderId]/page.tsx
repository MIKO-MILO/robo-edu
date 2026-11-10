"use client";

import { use } from "react";
import { PaymentInstructionPage } from "@/components/user/payment/payment-instruction-page";

interface PaymentPageProps {
  params: Promise<{ orderId: string }>;
}

/**
 * /payment/[orderId]
 *
 * Halaman pembayaran kustom RoboEdu (Core API UI).
 * Menampilkan instruksi pembayaran berdasarkan payment_channel.
 *
 * Semua kode Snap popup Midtrans (snap.js, window.snap.pay) telah
 * dihapus — digantikan oleh PaymentInstructionPage.
 */
export default function PaymentPage({ params }: PaymentPageProps) {
  const { orderId } = use(params);
  return <PaymentInstructionPage transactionId={orderId} context="order" />;
}
