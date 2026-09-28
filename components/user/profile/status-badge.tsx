import { Star } from "lucide-react";

interface StatusBadgeProps {
  label?: string;
}

/** Atomic: badge status user (Member / Reseller / dll) */
export function StatusBadge({ label = "Member" }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-yellow border-2 border-secondary neo-shadow-icon text-secondary text-sm font-semibold w-fit">
      <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
      {label}
    </span>
  );
}
