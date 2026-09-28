import * as React from "react";
import { Users, UserCheck, Award, Clock } from "lucide-react";
import { CustomerKpiCard } from "./customer-kpi-card";
import type { CustomerStats } from "./customer-list-types";

export interface CustomerStatsProps {
  stats: CustomerStats;
  onFilterReseller?: (tab: string) => void;
}

/**
 * Molecule — grid 4 KPI cards ringkasan data pelanggan.
 * Menerima `stats` yang sudah dihitung di parent / hook.
 */
export function CustomerStatsGrid({ stats, onFilterReseller }: CustomerStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <CustomerKpiCard
        icon={<Users className="size-5" />}
        label="Total Pelanggan"
        value={stats.total_customers}
        iconColorClass="bg-primary/10 text-primary"
        onClick={onFilterReseller ? () => onFilterReseller("ALL") : undefined}
      />
      <CustomerKpiCard
        icon={<UserCheck className="size-5" />}
        label="Pelanggan Aktif"
        value={stats.active_customers}
        iconColorClass="bg-success/10 text-success"
      />
      <CustomerKpiCard
        icon={<Award className="size-5" />}
        label="Reseller Aktif"
        value={stats.approved_resellers}
        iconColorClass="bg-purple-500/10 text-purple-600"
        onClick={onFilterReseller ? () => onFilterReseller("APPROVED") : undefined}
      />
      <CustomerKpiCard
        icon={<Clock className="size-5" />}
        label="Pengajuan Reseller"
        value={stats.pending_resellers}
        iconColorClass="bg-warning/10 text-warning"
        onClick={onFilterReseller ? () => onFilterReseller("PENDING") : undefined}
      />
    </div>
  );
}
