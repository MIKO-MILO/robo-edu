import { ExternalLink, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  APPLICANT_TYPE_LABELS,
  SALES_CHANNEL_LABELS,
  ESTIMATED_VOLUME_LABELS,
} from "@/types/reseller";
import type { ResellerApplication } from "@/types/reseller";

/**
 * ResellerApplicationDetail
 * -------------------------
 * Menampilkan seluruh data formulir pengajuan reseller secara read-only.
 * Dipakai bersama oleh view PENDING dan REJECTED.
 *
 * Tidak menerima onEdit/onUpdate — murni display.
 * Untuk re-apply, user diarahkan ke /reseller/apply via CTA di view REJECTED.
 */

interface ResellerApplicationDetailProps {
  application: ResellerApplication;
  className?: string;
}

// ---------------------------------------------------------------------------
// Sub-komponen atom: satu baris label + value
// ---------------------------------------------------------------------------
function DetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="font-body text-sm text-foreground">{children}</div>
    </div>
  );
}

// Nilai kosong / null
function EmptyValue() {
  return (
    <span className="flex items-center gap-1 text-muted-foreground text-sm italic">
      <Minus className="size-3" />
      Tidak diisi
    </span>
  );
}

// ---------------------------------------------------------------------------
// Helper: format tanggal ISO → "DD Bulan YYYY"
// ---------------------------------------------------------------------------
const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso));
}

// ---------------------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------------------
export function ResellerApplicationDetail({
  application,
  className,
}: ResellerApplicationDetailProps) {
  const {
    applicant_type,
    business_name,
    whatsapp_number,
    province,
    city,
    district,
    business_address,
    sales_channels,
    store_url,
    estimated_monthly_volume,
    reason,
    document_url,
    created_at,
  } = application;

  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-foreground bg-card overflow-hidden",
        className
      )}
    >
      {/* Header seksi */}
      <div className="border-b-2 border-foreground bg-muted px-5 py-3">
        <p className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Data Pengajuan &mdash; dikirim pada {formatDate(created_at)}
        </p>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        {/* Tipe Pemohon */}
        <DetailRow label="Tipe Pemohon">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-card px-3 py-0.5 text-xs font-semibold">
            {APPLICANT_TYPE_LABELS[applicant_type]}
          </span>
        </DetailRow>

        {/* Nama Usaha */}
        <DetailRow label="Nama Usaha / Institusi">
          {business_name}
        </DetailRow>

        {/* WhatsApp */}
        <DetailRow label="Nomor WhatsApp">
          {whatsapp_number}
        </DetailRow>

        {/* Wilayah */}
        <DetailRow label="Wilayah">
          {`Kec. ${district}, ${city}, ${province}`}
        </DetailRow>

        {/* Alamat lengkap — full width */}
        <DetailRow label="Alamat Usaha Lengkap" className="sm:col-span-2">
          {business_address}
        </DetailRow>

        {/* Kanal Penjualan — full width */}
        <DetailRow label="Kanal Penjualan" className="sm:col-span-2">
          <div className="flex flex-wrap gap-2 mt-0.5">
            {sales_channels.map((ch) => (
              <span
                key={ch}
                className="inline-flex items-center rounded-full border-2 border-foreground bg-accent-soft-blue px-3 py-0.5 text-xs font-semibold text-foreground"
              >
                {SALES_CHANNEL_LABELS[ch]}
              </span>
            ))}
          </div>
        </DetailRow>

        {/* Link Toko */}
        <DetailRow label="Link Toko / Media Sosial">
          {store_url ? (
            <a
              href={store_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:text-primary-600 transition-colors text-sm break-all"
            >
              {store_url}
              <ExternalLink className="size-3 shrink-0" />
            </a>
          ) : (
            <EmptyValue />
          )}
        </DetailRow>

        {/* Perkiraan Volume */}
        <DetailRow label="Perkiraan Pembelian / Bulan">
          {ESTIMATED_VOLUME_LABELS[estimated_monthly_volume]}
        </DetailRow>

        {/* Alasan — full width, preserves newline */}
        <DetailRow label="Alasan / Rencana Penjualan" className="sm:col-span-2">
          <p className="whitespace-pre-line leading-relaxed">{reason}</p>
        </DetailRow>

        {/* Dokumen Legalitas */}
        <DetailRow label="Dokumen Legalitas (NPWP / dll.)" className="sm:col-span-2">
          {document_url ? (
            /* 
              Backend DILARANG mengembalikan URL ini ke endpoint customer
              (PRD Bab 6.5 & types/reseller.ts).
              Jika null, tampilkan pesan informatif saja.
              Baris ini sebagai fallback jika backend tetap mengirim URL.
            */
            <span className="inline-flex items-center gap-1.5 text-success text-sm font-semibold">
              <span className="size-2 rounded-full bg-success" />
              Dokumen telah diunggah
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="size-2 rounded-full bg-muted-foreground/50" />
              Tidak ada dokumen diunggah
            </span>
          )}
        </DetailRow>
      </div>
    </div>
  );
}
