"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import { PaymentSection } from "@/components/admin/settings/payment-section";
import { OrderExpirySection } from "@/components/admin/settings/order-expiry-section";

export default function PaymentSettingsPage() {
  return (
    <div className="space-y-6 pb-10 font-body">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="size-6 text-primary stroke-[2.2]" aria-hidden="true" />
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Kelola Pembayaran
            </h1>
          </div>
          <p className="font-body text-sm text-muted-foreground mt-1 font-medium">
            Konfigurasi payment gateway, metode pembayaran, harga membership, dan masa berlaku order.
          </p>
        </div>
      </div>

      {/* Payment gateway & channels */}
      <PaymentSection />

      {/* Order expiry */}
      <OrderExpirySection />
    </div>
  );
}
