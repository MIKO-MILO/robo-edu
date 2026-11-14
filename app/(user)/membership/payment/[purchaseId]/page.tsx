"use client";

import { use } from "react";
import { PaymentInstructionPage } from "@/components/user/payment/payment-instruction-page";

interface MembershipPaymentPageProps {
  params: Promise<{ purchaseId: string }>;
}

/**
 * /membership/payment/[purchaseId]
 *
 * Halaman pembayaran untuk pembelian Membership RoboEdu Plus.
 * Menggunakan komponen PaymentInstructionPage yang sama dengan
 * /payment/[orderId], dengan context="membership" agar redirect
 * setelah PAID menuju /profile/membership bukan /profile/orders.
 */
export default function MembershipPaymentPage({
  params,
}: MembershipPaymentPageProps) {
  const { purchaseId } = use(params);
  return (
    <PaymentInstructionPage
      transactionId={purchaseId}
      context="membership"
    />
  );
}
