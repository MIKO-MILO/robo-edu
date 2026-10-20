import Link from "next/link";
import { XCircle, MessageSquareWarning, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResellerStatusBadge } from "./reseller-status-badge";
import { ResellerApplicationDetail } from "./reseller-application-detail";
import type { ResellerApplication } from "@/types/reseller";

/**
 * ResellerStatusRejected
 * ----------------------
 * Tampilan untuk user dengan reseller_status = REJECTED.
 * PRD Bab 6.6: "Badge merah 'Pengajuan Ditolak' beserta alasan dari admin.
 *              CTA 'Ajukan Ulang' (form terisi data lama)."
 *
 * Link ke /reseller/apply — halaman itu bertanggung jawab pre-fill data lama
 * via GET /reseller/application (PRD Bab 6.6 edge case).
 */

interface ResellerStatusRejectedProps {
  application: ResellerApplication;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function ResellerStatusRejected({ application }: ResellerStatusRejectedProps) {
  const submittedAt = DATE_FORMATTER.format(new Date(application.created_at));
  const reviewedAt = application.reviewed_at
    ? DATE_FORMATTER.format(new Date(application.reviewed_at))
    : null;

  return (
    <div className="space-y-5">
      {/* Status card header */}
      <div className="rounded-3xl border-2 border-foreground bg-card p-8 neo-shadow">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border-2 border-foreground bg-danger-bg neo-shadow-icon">
              <XCircle className="size-6 text-danger" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                Status Pengajuan Reseller
              </h2>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Diajukan pada {submittedAt}
                {reviewedAt && (
                  <> &middot; Ditinjau pada {reviewedAt}</>
                )}
              </p>
            </div>
          </div>
          <ResellerStatusBadge status="REJECTED" />
        </div>

        {/* Alasan penolakan dari admin */}
        {application.rejection_reason ? (
          <div className="flex items-start gap-3 rounded-2xl border-2 border-foreground bg-danger-bg px-5 py-4 mb-6">
            <MessageSquareWarning className="size-5 text-danger shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-heading text-sm font-bold text-danger">
                Alasan Penolakan
              </p>
              <p className="font-body text-sm text-foreground leading-relaxed whitespace-pre-line">
                {application.rejection_reason}
              </p>
            </div>
          </div>
        ) : (
          /* Fallback jika rejection_reason null (seharusnya tidak terjadi per PRD 6.7) */
          <div className="flex items-start gap-3 rounded-2xl border-2 border-foreground bg-muted px-5 py-4 mb-6">
            <XCircle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="font-body text-sm text-muted-foreground">
              Tidak ada catatan alasan dari admin. Silakan hubungi support
              RoboEdu untuk informasi lebih lanjut.
            </p>
          </div>
        )}

        {/* Info re-apply */}
        <div className="rounded-2xl border-2 border-foreground bg-muted px-5 py-4 mb-6">
          <p className="font-body text-xs text-muted-foreground leading-relaxed">
            Kamu dapat mengajukan ulang kapan saja. Data pengajuan sebelumnya
            akan otomatis terisi di formulir sehingga kamu hanya perlu
            melakukan perbaikan yang diperlukan.
          </p>
        </div>

        {/* CTA */}
        <Button
          asChild
          variant="primary"
          size="lg"
          neo
          className="font-heading font-bold rounded-2xl w-full sm:w-auto"
        >
          <Link href="/reseller/apply">
            <RotateCcw className="size-4" />
            Ajukan Ulang
          </Link>
        </Button>
      </div>

      {/* Data pengajuan sebelumnya — read-only */}
      <ResellerApplicationDetail application={application} />
    </div>
  );
}
