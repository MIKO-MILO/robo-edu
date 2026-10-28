import * as React from "react";
import { MessageSquareWarning, Inbox, Clock, CheckCircle2 } from "lucide-react";
import type { ComplaintStats } from "./complaint-list-types";

interface ComplaintKpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconColorClass: string;
}

/**
 * Atom — kartu KPI tunggal untuk ringkasan statistik klaim.
 */
function ComplaintKpiCard({ icon, label, value, iconColorClass }: ComplaintKpiCardProps) {
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-4 flex items-center gap-3 shadow-xs">
      <div className={`flex size-10 items-center justify-center rounded-xl shrink-0 ${iconColorClass}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-body text-xs text-muted-foreground truncate">{label}</p>
        <p className="font-heading font-bold text-2xl text-foreground leading-tight">{value}</p>
      </div>
    </div>
  );
}

export interface ComplaintStatsGridProps {
  stats: ComplaintStats;
}

/**
 * Molecule — grid 4 KPI cards ringkasan status klaim.
 */
export function ComplaintStatsGrid({ stats }: ComplaintStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ComplaintKpiCard
        icon={<MessageSquareWarning className="size-5" />}
        label="Total Klaim"
        value={stats.total}
        iconColorClass="bg-primary/10 text-primary"
      />
      <ComplaintKpiCard
        icon={<Inbox className="size-5" />}
        label="Terbuka"
        value={stats.open}
        iconColorClass="bg-danger-bg text-danger"
      />
      <ComplaintKpiCard
        icon={<Clock className="size-5" />}
        label="Sedang Ditinjau"
        value={stats.in_review}
        iconColorClass="bg-warning-bg text-warning"
      />
      <ComplaintKpiCard
        icon={<CheckCircle2 className="size-5" />}
        label="Terselesaikan"
        value={stats.resolved}
        iconColorClass="bg-success-bg text-success"
      />
    </div>
  );
}
