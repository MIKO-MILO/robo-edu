import type { OrderStatus, PaymentStatus } from "@/types/enums";
import type { StatusTheme } from "@/components/admin/status-badge";

export interface OrderDisplayStatus {
  label: string;
  theme: StatusTheme;
}

/**
 * Derive a single display status from the combination of order status and
 * payment status.
 *
 * `order.status` is primary — it covers the full fulfillment lifecycle.
 * `payment.status` is only consulted for two edge cases:
 *   - PENDING orders: distinguish still-waiting vs failed vs expired payment.
 *   - CANCELLED orders: flag when a manual refund is needed (payment arrived
 *     after the order was cancelled).
 */
export function deriveOrderDisplayStatus(
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
): OrderDisplayStatus {
  switch (orderStatus) {
    case "PENDING":
      if (paymentStatus === "EXPIRED") return { label: "Kedaluwarsa",       theme: "muted"     };
      if (paymentStatus === "FAILED")  return { label: "Pembayaran Gagal",  theme: "danger"    };
      return                                   { label: "Menunggu Dibayar", theme: "warning"   };

    case "PAID":
      return { label: "Menunggu Diproses", theme: "info" };

    case "PROCESSING":
      return { label: "Sedang Diproses", theme: "purple" };

    case "SHIPPED":
      return { label: "Dikirim", theme: "info" };

    case "DELIVERED":
      return { label: "Terkirim", theme: "softBlue" };

    case "COMPLETED":
      return { label: "Selesai", theme: "success" };

    case "REFUNDED":
      return { label: "Di-Refund", theme: "orange" };

    case "CANCELLED":
      if (paymentStatus === "PAID")
        return { label: "Dibatalkan · Perlu Refund", theme: "danger" };
      return { label: "Dibatalkan", theme: "danger" };
  }
}
