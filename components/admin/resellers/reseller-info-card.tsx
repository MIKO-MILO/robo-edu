import * as React from "react";
import {
  BadgeCheck,
  MapPin,
  IdCard,
  Receipt,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResellerInfoCardProps {
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  resellerAppliedAt: string | null;
  resellerApprovedAt: string | null;
  rejectionReason?: string | null;
  // Untuk phase backend: legalitas data akan datang dari API
  // Sementara disimulasikan dengan data placeholder
  affiliationName?: string | null;
  ktpNik?: string | null;
  npwpNumber?: string | null;
  primaryAddress?: string | null;
}

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoString));
}

function formatDateTime(isoString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Shared bento card header used within this component */
function BentoCardHeader({
  icon: Icon,
  title,
  badge,
  bgColor = "bg-accent-soft-blue",
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  bgColor?: string;
}) {
  return (
    <div
      className={cn(
        "p-4 border-b-2 border-border flex items-center justify-between",
        bgColor
      )}
    >
      <h2 className="font-heading text-sm md:text-base font-bold flex items-center gap-2 text-foreground">
        <Icon className="size-[18px]" />
        {title}
      </h2>
      {badge && (
        <span className="border border-border bg-card text-[10px] font-mono px-2 py-0.5 font-bold text-foreground">
          {badge}
        </span>
      )}
    </div>
  );
}

/** Individual data field cell — Neo muted box */
function DataCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-3 bg-muted border border-border">
      <span className="text-[11px] font-bold text-secondary uppercase block mb-0.5">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

/**
 * Molecule — Kartu informasi legalitas + timeline akun reseller (Neo-Brutalist).
 * Terdiri dari:
 *   1. Bento Legalitas & Alamat Pemohon (dokumen KTP/NPWP, alamat utama)
 *   2. Milestone & Riwayat Akun (timeline)
 *   3. Catatan penolakan (conditional, jika REJECTED)
 */
export function ResellerInfoCard({
  name,
  email,
  phone,
  createdAt,
  lastLoginAt,
  resellerAppliedAt,
  resellerApprovedAt,
  rejectionReason,
  affiliationName,
  ktpNik,
  npwpNumber,
  primaryAddress,
}: ResellerInfoCardProps) {
  return (
    <div className="space-y-6">
      {/* ── 1. Legalitas & Alamat Pemohon ── */}
      <div className="border-2 border-border neo-shadow bg-card">
        <BentoCardHeader
          icon={BadgeCheck}
          title="Data Legalitas & Alamat Pemohon"
          badge="user_address"
          bgColor="bg-accent-soft-blue"
        />
        <div className="p-5 space-y-4">
          {/* 2-column fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DataCell label="Nama Lengkap" value={name} />
            <DataCell label="Instansi Afiliasi" value={affiliationName ?? "—"} />
            <DataCell
              label="Nomor WhatsApp"
              value={<span className="font-mono">{phone ?? "—"}</span>}
            />
            <DataCell label="Alamat Email" value={email} />
          </div>

          {/* Primary address box */}
          {primaryAddress && (
            <div className="p-3.5 border-2 border-border bg-background space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold flex items-center gap-1.5 text-foreground">
                  <MapPin className="size-4 text-primary" />
                  Alamat Pengiriman Utama
                </span>
                <span className="border border-border bg-success-bg text-[10px] font-mono px-1.5 py-0.5 font-bold text-success">
                  is_primary: true
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-body font-medium leading-relaxed">
                {primaryAddress}
              </p>
            </div>
          )}

          {/* Document attachments */}
          <div>
            <span className="text-xs font-heading font-bold block mb-2 text-foreground">
              Berkas Verifikasi Terlampir
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* KTP */}
              <div className="p-3 border-2 border-border neo-shadow-icon bg-card flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <IdCard className="size-6 text-primary" />
                  <div>
                    <div className="text-xs font-bold font-heading">Kartu Tanda Penduduk</div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      NIK: {ktpNik ?? "••••••••••••••••"}
                    </div>
                  </div>
                </div>
                {/* TODO: Wire to MinIO document preview when backend ready */}
                <span
                  className={cn(
                    "border-2 border-border bg-warning-bg neo-shadow-icon",
                    "text-[11px] font-heading font-bold px-2.5 py-1.5",
                    "text-foreground cursor-default"
                  )}
                  title="Preview dokumen akan tersedia setelah integrasi storage backend"
                >
                  PREVIEW
                </span>
              </div>

              {/* NPWP */}
              <div className="p-3 border-2 border-border neo-shadow-icon bg-card flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Receipt className="size-6 text-secondary" />
                  <div>
                    <div className="text-xs font-bold font-heading">NPWP Pribadi</div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      NPWP: {npwpNumber ?? "••.•••.•••.•-•••"}
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "border-2 border-border bg-warning-bg neo-shadow-icon",
                    "text-[11px] font-heading font-bold px-2.5 py-1.5",
                    "text-foreground cursor-default"
                  )}
                  title="Preview dokumen akan tersedia setelah integrasi storage backend"
                >
                  PREVIEW
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ── 3. Milestone & Riwayat Akun ── */}
      <div className="border-2 border-border neo-shadow bg-card">
        <BentoCardHeader
          icon={FileText}
          title="Milestone & Riwayat Akun"
          bgColor="bg-muted"
        />
        <div className="p-5">
          <ol className="relative border-l-2 border-border ml-3 space-y-6">
            {/* Terdaftar */}
            <li className="relative pl-6">
              <div className="absolute -left-[9px] top-0 size-4 rounded-full border-2 border-border bg-success-bg" />
              <div className="text-[10px] font-mono font-bold text-muted-foreground">
                {formatDate(createdAt).toUpperCase()}
              </div>
              <h3 className="font-heading text-xs font-bold text-foreground">
                Registrasi Akun Pelanggan
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-body">
                Membuat akun customer reguler.
              </p>
            </li>

            {/* Login terakhir */}
            {lastLoginAt && (
              <li className="relative pl-6">
                <div className="absolute -left-[9px] top-0 size-4 rounded-full border-2 border-border bg-success-bg" />
                <div className="text-[10px] font-mono font-bold text-muted-foreground">
                  {formatDateTime(lastLoginAt).toUpperCase()}
                </div>
                <h3 className="font-heading text-xs font-bold text-foreground">Login Terakhir</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">
                  Sesi aktif terakhir tercatat.
                </p>
              </li>
            )}

            {/* Pengajuan reseller */}
            {resellerAppliedAt && (
              <li className="relative pl-6">
                <div className="absolute -left-[9px] top-0 size-4 rounded-full border-2 border-border bg-warning-bg" />
                <div className="text-[10px] font-mono font-bold text-warning">
                  {formatDateTime(resellerAppliedAt).toUpperCase()}
                </div>
                <h3 className="font-heading text-xs font-bold text-foreground">
                  Pengajuan Formulir Reseller Masuk
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">
                  Mengunggah berkas legalitas dan data institusi.
                </p>
              </li>
            )}

            {/* Disetujui */}
            {resellerApprovedAt && (
              <li className="relative pl-6">
                <div className="absolute -left-[9px] top-0 size-4 rounded-full border-2 border-border bg-success" />
                <div className="text-[10px] font-mono font-bold text-success">
                  {formatDateTime(resellerApprovedAt).toUpperCase()}
                </div>
                <h3 className="font-heading text-xs font-bold text-success">
                  Pengajuan Reseller Disetujui
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">
                  Hak akses harga reseller_price telah aktif.
                </p>
              </li>
            )}

            {/* Current: Menunggu keputusan (hanya jika masih PENDING) */}
            {!resellerApprovedAt && resellerAppliedAt && !rejectionReason && (
              <li className="relative pl-6">
                <div className="absolute -left-[9px] top-0 size-4 rounded-full border-2 border-border bg-primary animate-pulse" />
                <div className="text-[10px] font-mono font-bold text-primary">
                  HARI INI (REALTIME)
                </div>
                <h3 className="font-heading text-xs font-bold text-primary">
                  Menunggu Keputusan Verifikasi Admin
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">
                  Sesi peninjauan oleh admin aktif di dasbor.
                </p>
              </li>
            )}
          </ol>
        </div>
      </div>

      {/* ── 4. Catatan Penolakan (hanya jika REJECTED) ── */}
      {rejectionReason && (
        <div className="border-2 border-danger neo-shadow bg-danger-bg p-5 space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-danger" />
            <h3 className="font-heading font-bold text-sm text-danger">Alasan Penolakan</h3>
          </div>
          <p className="text-xs text-foreground leading-relaxed font-body">{rejectionReason}</p>
        </div>
      )}
    </div>
  );
}
