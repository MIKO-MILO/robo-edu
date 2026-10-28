import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDashed } from "lucide-react";
import type { MembershipStatus } from "@/types/enums";

/**
 * MembershipStatusBadge
 * ---------------------
 * Atom badge yang merepresentasikan status membership user.
 * Dipakai di membership-info-card.tsx.
 *
 * MEMBER    → badge hijau "Member Aktif"
 * NOT_MEMBER → tidak dirender (komponen NOT_MEMBER punya tampilan sendiri)
 *
 * PRD Bab 6.8 | US-011
 */

interface MembershipStatusBadgeProps {
  status: MembershipStatus;
  className?: string;
}

const BADGE_CONFIG: Record<
  MembershipStatus,
  {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  MEMBER: {
    label: "Member Aktif",
    Icon: CheckCircle2,
    className: "bg-success-bg text-success border-success/40",
  },
  NOT_MEMBER: {
    label: "Standar",
    Icon: CircleDashed,
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function MembershipStatusBadge({
  status,
  className,
}: MembershipStatusBadgeProps) {
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
