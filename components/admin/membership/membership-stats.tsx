import * as React from "react";
import { Users, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { ResellerKpiCard } from "./membership-kpi-card";
import type { AdminMemberStats } from "./membership-list-types";

export interface ResellerStatsProps {
  stats: AdminMemberStats;
  totalCount?: number;
  onFilterStatus?: (tab: string) => void;
}

/**
 * Molecule — grid 4 KPI cards ringkasan status member.
 * Mendukung klik untuk filter terkait.
 */
export function ResellerStatsGrid({ stats, totalCount, onFilterStatus }: ResellerStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ResellerKpiCard
        icon={<Users className="size-5" />}
        label="Total Member"
        value={totalCount ?? stats.total_members}
        iconColorClass="bg-primary/10 text-primary"
        onClick={onFilterStatus ? () => onFilterStatus("ALL") : undefined}
      />
      <ResellerKpiCard
        icon={<CheckCircle2 className="size-5" />}
        label="Member Aktif"
        value={stats.active_members}
        iconColorClass="bg-success/10 text-success"
      />
      <ResellerKpiCard
        icon={<Clock className="size-5" />}
        label="Segera Expired"
        value={stats.expiring_soon}
        iconColorClass="bg-warning/10 text-warning"
      />
      <ResellerKpiCard
        icon={<AlertCircle className="size-5" />}
        label="Sudah Expired"
        value={stats.expired_members}
        iconColorClass="bg-danger/10 text-danger"
      />
    </div>
  );
}
