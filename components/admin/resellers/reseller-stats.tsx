import * as React from "react";
import { Award, Clock, XCircle, Users } from "lucide-react";
import { ResellerKpiCard } from "./reseller-kpi-card";
import type { ResellerStats } from "./reseller-list-types";

export interface ResellerStatsProps {
  stats: ResellerStats;
  onFilterStatus?: (tab: string) => void;
}

/**
 * Molecule — grid 4 KPI cards ringkasan status pengajuan reseller.
 * Mendukung klik untuk filter status terkait.
 */
export function ResellerStatsGrid({ stats, onFilterStatus }: ResellerStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ResellerKpiCard
        icon={<Users className="size-5" />}
        label="Total Pemohon"
        value={stats.total_applicants}
        iconColorClass="bg-primary/10 text-primary"
        onClick={onFilterStatus ? () => onFilterStatus("ALL") : undefined}
      />
      <ResellerKpiCard
        icon={<Clock className="size-5" />}
        label="Menunggu Review"
        value={stats.pending_requests}
        iconColorClass="bg-warning/10 text-warning"
        onClick={onFilterStatus ? () => onFilterStatus("PENDING") : undefined}
      />
      <ResellerKpiCard
        icon={<Award className="size-5" />}
        label="Reseller Aktif"
        value={stats.total_resellers}
        iconColorClass="bg-purple-500/10 text-purple-600"
        onClick={onFilterStatus ? () => onFilterStatus("APPROVED") : undefined}
      />
      <ResellerKpiCard
        icon={<XCircle className="size-5" />}
        label="Pengajuan Ditolak"
        value={stats.rejected_requests}
        iconColorClass="bg-danger/10 text-danger"
        onClick={onFilterStatus ? () => onFilterStatus("REJECTED") : undefined}
      />
    </div>
  );
}
