import * as React from "react";
import { CreditCard } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { OrderInfoCard } from "./order-info-card";
import type { PaymentStatus } from "@/types/enums";

export interface OrderPaymentInfo {
  status: PaymentStatus;
  method: string;
  midtrans_transaction_id: string | null;
  payment_method: string | null;
  payment_channel: string | null;
}

export interface OrderPaymentCardProps {
  payment: OrderPaymentInfo;
}

/**
 * Molecule — card status pembayaran (status badge, metode, ID transaksi).
 */
export function OrderPaymentCard({ payment }: OrderPaymentCardProps) {
  return (
    <OrderInfoCard
      icon={<CreditCard className="size-4" />}
      title="Status Pembayaran"
    >
      <div className="space-y-2 text-xs font-body">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <StatusBadge status={payment.status} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Metode</span>
          <span className="font-semibold text-foreground">{payment.method}</span>
        </div>
        {payment.payment_method && payment.payment_method !== payment.method && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Channel</span>
            <span className="font-semibold text-foreground">
              {payment.payment_channel ?? payment.payment_method}
            </span>
          </div>
        )}
        {payment.midtrans_transaction_id && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground shrink-0">ID Transaksi</span>
            <span className="font-mono text-xs text-right break-all">
              {payment.midtrans_transaction_id}
            </span>
          </div>
        )}
      </div>
    </OrderInfoCard>
  );
}
