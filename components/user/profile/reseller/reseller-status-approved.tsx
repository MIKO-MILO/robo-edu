import Link from "next/link";
import { ShieldCheck, CalendarCheck2, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResellerStatusBadge } from "./reseller-status-badge";

/**
 * ResellerStatusApproved
 * ----------------------
 * Tampilan untuk user dengan reseller_status = APPROVED.
 * PRD Bab 6.6: "Badge hijau 'Reseller Aktif', tanggal disetujui, CTA 'Lihat Produk'."
 */

interface ResellerStatusApprovedProps {
  /** ISO date string dari user.reseller_approved_at */
  approvedAt: string;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function ResellerStatusApproved({ approvedAt }: ResellerStatusApprovedProps) {
  const formattedDate = DATE_FORMATTER.format(new Date(approvedAt));

  return (
    <div className="space-y-5">
      {/* Status card utama */}
      <div className="rounded-3xl border-2 border-foreground bg-card p-8 neo-shadow">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl border-2 border-foreground bg-success-bg neo-shadow-icon">
              <ShieldCheck className="size-6 text-success" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                Status Kemitraan Reseller
              </h2>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Akun ini telah diverifikasi oleh tim RoboEdu
              </p>
            </div>
          </div>
          <ResellerStatusBadge status="APPROVED" />
        </div>

        {/* Info tanggal disetujui */}
        <div className="flex items-center gap-3 rounded-2xl border-2 border-foreground bg-success-bg px-5 py-4 mb-6">
          <CalendarCheck2 className="size-5 text-success shrink-0" />
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-widest text-success">
              Disetujui sejak
            </p>
            <p className="font-body text-sm font-semibold text-foreground">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Highlight manfaat aktif */}
        <div className="rounded-2xl border-2 border-foreground bg-muted p-5 mb-6">
          <p className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Keuntungan aktif
          </p>
          <div className="flex items-start gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl border-2 border-foreground bg-accent-yellow neo-shadow-icon shrink-0">
              <Tag className="size-4 text-foreground" />
            </div>
            <p className="font-body text-sm text-foreground leading-relaxed">
              Harga reseller otomatis diterapkan di seluruh katalog, cart, dan
              checkout. Harga ini berlaku selama status reseller aktif.
            </p>
          </div>
        </div>

        {/* CTA */}
        <Button
          asChild
          variant="primary"
          size="lg"
          neo
          className="font-heading font-bold rounded-2xl w-full sm:w-auto"
        >
          <Link href="/product">
            Lihat Produk
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
