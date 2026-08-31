import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Config — memetakan setiap OrderStatus ke label Indonesia & kelas warna.
// Kalau status baru ditambahkan di enums.ts, tambahkan entri di sini.
// ─────────────────────────────────────────────────────────────────────────────
interface StatusConfig {
  label: string;
  className: string;
}

const STATUS_MAP: Record<OrderStatus, StatusConfig> = {
  PENDING: {
    label: "Belum Bayar",
    className: "bg-warning-bg text-warning border-warning",
  },
  PAID: {
    label: "Menunggu Konfirmasi",
    className: "bg-info-bg text-info border-info",
  },
  PROCESSING: {
    label: "Diproses",
    className: "bg-info-bg text-info border-info",
  },
  SHIPPED: {
    label: "Dikirim",
    className: "bg-accent-purple text-foreground border-foreground",
  },
  DELIVERED: {
    label: "Tiba di Tujuan",
    className: "bg-accent-blue text-foreground border-foreground",
  },
  COMPLETED: {
    label: "Selesai",
    className: "bg-success-bg text-success border-success",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-danger-bg text-danger border-danger",
  },
  REFUNDED: {
    label: "Dikembalikan",
    className: "bg-accent-peach text-foreground border-foreground",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full",
        "text-xs font-semibold font-body whitespace-nowrap border",
        config.className,
        className,
      )}
    >
      <span
        className="size-1.5 rounded-full bg-current opacity-70 shrink-0"
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
