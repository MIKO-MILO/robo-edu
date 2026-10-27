import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, Ban, RotateCcw } from "lucide-react";
import type { MembershipPurchaseStatus } from "@/types/enums";

/**
 * MembershipPurchaseStatusBadge
 * -----------------------------
 * Badge status untuk satu baris di tabel purchase history.
 *
 * PENDING  → kuning  "Menunggu Pembayaran"
 * PAID     → hijau   "Berhasil"
 * FAILED   → merah   "Gagal"
 * EXPIRED  → abu     "Kedaluwarsa"
 * REFUNDED → biru    "Dikembalikan"
 *
 * PRD Bab 6.8 (kolom Status tabel purchase history)
 */

interface MembershipPurchaseStatusBadgeProps {
  status: MembershipPurchaseStatus;
  className?: string;
}

const BADGE_CONFIG: Record<
  MembershipPurchaseStatus,
  {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  PENDING: {
    label: "Menunggu Pembayaran",
    Icon: Clock,
    className: "bg-warning-bg text-warning border-warning/40",
  },
  PAID: {
    label: "Berhasil",
    Icon: CheckCircle2,
    className: "bg-success-bg text-success border-success/40",
  },
  FAILED: {
    label: "Gagal",
    Icon: XCircle,
    className: "bg-danger-bg text-danger border-danger/40",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    Icon: Ban,
    className: "bg-muted text-muted-foreground border-border",
  },
  REFUNDED: {
    label: "Dikembalikan",
    Icon: RotateCcw,
    className: "bg-accent-soft-blue/30 text-primary border-primary/30",
  },
};

export function MembershipPurchaseStatusBadge({
  status,
  className,
}: MembershipPurchaseStatusBadgeProps) {
  const { label, Icon, className: variantClass } = BADGE_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1",
        "font-body text-xs font-semibold whitespace-nowrap",
        variantClass,
        className
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {label}
    </span>
  );
}
