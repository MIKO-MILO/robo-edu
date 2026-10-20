import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import type { ResellerStatus } from "@/types/enums";

/**
 * ResellerStatusBadge
 * -------------------
 * Atom badge yang merepresentasikan status pengajuan reseller customer.
 * Berbeda dari `status-badge.tsx` (yang untuk label Member/Reseller di avatar).
 *
 * Hanya menerima PENDING | APPROVED | REJECTED — bukan NOT_RESELLER
 * karena status itu tidak perlu badge pengajuan.
 *
 * Dipakai oleh:
 *   - reseller-status-pending.tsx
 *   - reseller-status-approved.tsx
 *   - reseller-status-rejected.tsx
 */

type DisplayableResellerStatus = Exclude<ResellerStatus, "NOT_RESELLER">;

interface ResellerStatusBadgeProps {
  status: DisplayableResellerStatus;
  className?: string;
}

const BADGE_CONFIG: Record<
  DisplayableResellerStatus,
  {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  PENDING: {
    label: "Menunggu Review",
    Icon: Clock,
    className:
      "bg-warning-bg text-warning border-warning/40",
  },
  APPROVED: {
    label: "Reseller Aktif",
    Icon: CheckCircle2,
    className:
      "bg-success-bg text-success border-success/40",
  },
  REJECTED: {
    label: "Pengajuan Ditolak",
    Icon: XCircle,
    className:
      "bg-danger-bg text-danger border-danger/40",
  },
};

export function ResellerStatusBadge({
  status,
  className,
}: ResellerStatusBadgeProps) {
  const { label, Icon, className: variantClass } = BADGE_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5",
        "font-body text-sm font-semibold",
        variantClass,
        className
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </span>
  );
}
