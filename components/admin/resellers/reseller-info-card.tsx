import * as React from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  ShoppingBag,
  CircleDollarSign,
} from "lucide-react";

export interface ResellerInfoCardProps {
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  resellerAppliedAt: string | null;
  resellerApprovedAt: string | null;
  totalOrders: number;
  totalSpent: number;
  rejectionReason?: string | null;
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

/**
 * Molecule — Kartu informasi lengkap pemohon reseller untuk halaman detail.
 * Menampilkan data kontak, metrik belanja, timeline pengajuan, dan catatan penolakan.
 */
export function ResellerInfoCard({
  name,
  email,
  phone,
  createdAt,
  lastLoginAt,
  resellerAppliedAt,
  resellerApprovedAt,
  totalOrders,
  totalSpent,
  rejectionReason,
}: ResellerInfoCardProps) {
  return (
    <div className="space-y-4">
      {/* 1. Data Kontak */}
      <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-border pb-3">
          <User className="size-4 text-primary" />
          <h3 className="font-heading font-bold text-sm text-foreground">
            Data Pemohon
          </h3>
        </div>

        <div className="space-y-3 text-xs font-body">
          <div>
            <div className="text-muted-foreground">Nama Lengkap</div>
            <div className="font-semibold text-foreground mt-0.5">{name}</div>
          </div>

          <div>
            <div className="text-muted-foreground">Email</div>
            <div className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="size-3.5 text-muted-foreground" />
              <span>{email}</span>
            </div>
          </div>

          <div>
            <div className="text-muted-foreground">Nomor Telepon / WhatsApp</div>
            <div className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
              <Phone className="size-3.5 text-muted-foreground" />
              <span>{phone || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Metrik Belanja */}
      <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-border pb-3">
          <CircleDollarSign className="size-4 text-primary" />
          <h3 className="font-heading font-bold text-sm text-foreground">
            Riwayat Belanja
          </h3>
        </div>

        <div className="space-y-3 text-xs font-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CircleDollarSign className="size-3.5" />
              <span>Total Belanja (LTV)</span>
            </div>
            <span className="font-heading font-bold text-foreground">
              {formatIDR(totalSpent)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShoppingBag className="size-3.5" />
              <span>Total Pesanan</span>
            </div>
            <span className="font-semibold text-foreground">{totalOrders} Pesanan</span>
          </div>
        </div>
      </div>

      {/* 3. Timeline Akun */}
      <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 border-b-2 border-border pb-2.5">
          <Clock className="size-4 text-primary" />
          <h3 className="font-heading font-bold text-sm text-foreground">
            Timeline Pengajuan
          </h3>
        </div>

        <div className="space-y-2 text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" /> Terdaftar:
            </span>
            <span className="font-semibold text-foreground">
              {formatDate(createdAt)}
            </span>
          </div>

          {lastLoginAt && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="size-3" /> Terakhir Login:
              </span>
              <span className="font-semibold text-foreground">
                {formatDateTime(lastLoginAt)}
              </span>
            </div>
          )}

          {resellerAppliedAt && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="size-3 text-warning" /> Tanggal Pengajuan:
              </span>
              <span className="font-semibold text-foreground">
                {formatDateTime(resellerAppliedAt)}
              </span>
            </div>
          )}

          {resellerApprovedAt && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Award className="size-3 text-success" /> Tanggal Disetujui:
              </span>
              <span className="font-semibold text-success">
                {formatDateTime(resellerApprovedAt)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Catatan Penolakan (hanya jika ada) */}
      {rejectionReason && (
        <div className="bg-danger-bg p-5 rounded-2xl border-2 border-danger/30 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-danger" />
            <h3 className="font-heading font-bold text-sm text-danger">
              Alasan Penolakan
            </h3>
          </div>
          <p className="text-xs text-foreground leading-relaxed font-body">
            {rejectionReason}
          </p>
        </div>
      )}
    </div>
  );
}
