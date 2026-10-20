import { Clock, Info } from "lucide-react";
import { ResellerStatusBadge } from "./reseller-status-badge";
import { ResellerApplicationDetail } from "./reseller-application-detail";
import type { ResellerApplication } from "@/types/reseller";

/**
 * ResellerStatusPending
 * ---------------------
 * Tampilan untuk user dengan reseller_status = PENDING.
 * PRD Bab 6.6: "Badge kuning 'Menunggu Review', tanggal pengajuan,
 *              dan data yang dikirim (read-only)."
 *
 * Tidak ada CTA — pengajuan sedang dalam proses.
 * Opsional "Batalkan Pengajuan" disimpan untuk fase berikutnya.
 */

interface ResellerStatusPendingProps {
  application: ResellerApplication;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function ResellerStatusPending({ application }: ResellerStatusPendingProps) {
  const submittedAt = DATE_FORMATTER.format(new Date(application.created_at));

  return (
    <div className="space-y-5">
      {/* Status card header */}
      <div className="rounded-3xl border-2 border-foreground bg-card p-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border-2 border-foreground bg-warning-bg neo-shadow-icon">
              <Clock className="size-6 text-warning" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                Status Pengajuan Reseller
              </h2>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Dikirim pada {submittedAt}
              </p>
            </div>
          </div>
          <ResellerStatusBadge status="PENDING" />
        </div>

        {/* Info callout */}
        <div className="flex items-start gap-3 rounded-2xl border-2 border-foreground bg-warning-bg px-5 py-4">
          <Info className="size-5 text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-heading text-sm font-bold text-foreground">
              Pengajuan sedang ditinjau
            </p>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              Tim RoboEdu akan memeriksa pengajuanmu dalam{" "}
              <strong className="text-foreground">1–3 hari kerja</strong>.
              Kamu akan menerima notifikasi email setelah keputusan dibuat.
            </p>
          </div>
        </div>
      </div>

      {/* Data pengajuan read-only */}
      <ResellerApplicationDetail application={application} />
    </div>
  );
}
