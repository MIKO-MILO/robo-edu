"use client";

import * as React from "react";
import { CheckCircle2, XCircle, ShieldAlert, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResellerStatus } from "@/types/enums";

export interface ResellerApprovalCardProps {
  resellerStatus: ResellerStatus;
  applicantName: string;
  onApprove?: () => void;
  onReject?: () => void;
}

/**
 * Molecule — Kartu aksi approve/reject pengajuan reseller.
 * Menampilkan state berbeda berdasarkan resellerStatus:
 *   - PENDING: tombol Setujui & Tolak
 *   - APPROVED: status sudah disetujui (read-only)
 *   - REJECTED: status sudah ditolak (read-only)
 */
export function ResellerApprovalCard({
  resellerStatus,
  applicantName,
  onApprove,
  onReject,
}: ResellerApprovalCardProps) {
  if (resellerStatus === "APPROVED") {
    return (
      <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-success/10 text-success">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-foreground">
              Pengajuan Disetujui
            </div>
            <div className="text-xs text-muted-foreground">
              {applicantName} telah mendapatkan akses harga reseller.
            </div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-xs text-success font-body">
          Reseller aktif dapat menikmati harga khusus pada seluruh produk RoboEdu.
        </div>
      </div>
    );
  }

  if (resellerStatus === "REJECTED") {
    return (
      <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-danger/10 text-danger">
            <XCircle className="size-4" />
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-foreground">
              Pengajuan Ditolak
            </div>
            <div className="text-xs text-muted-foreground">
              Pengajuan dari {applicantName} telah ditolak.
            </div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-danger-bg border border-danger/20 text-xs text-danger font-body">
          Customer tetap berstatus pelanggan reguler dan menggunakan harga normal.
        </div>
      </div>
    );
  }

  // PENDING state — tampilkan action buttons
  return (
    <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-warning/10 text-warning">
          <Clock className="size-4" />
        </div>
        <div>
          <div className="font-heading font-bold text-sm text-foreground">
            Tindak Lanjut Pengajuan
          </div>
          <div className="text-xs text-muted-foreground">
            Review pengajuan reseller dari {applicantName}
          </div>
        </div>
      </div>

      {/* Warning notice */}
      <div className="p-3 rounded-xl bg-warning-bg border border-warning/30 flex items-start gap-2 text-xs text-warning font-body">
        <ShieldAlert className="size-3.5 shrink-0 mt-0.5" />
        <span>
          Setelah menyetujui, {applicantName} akan langsung mendapatkan akses ke
          harga reseller untuk semua produk. Pastikan data pemohon sudah terverifikasi.
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="default"
          className="flex-1 gap-2 rounded-xl bg-primary hover:bg-primary-600 font-heading font-bold text-sm text-primary-foreground"
          onClick={onApprove}
        >
          <CheckCircle2 className="size-4" />
          Setujui Pengajuan
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2 rounded-xl border-2 border-border text-danger hover:text-danger font-heading font-bold text-sm"
          onClick={onReject}
        >
          <XCircle className="size-4" />
          Tolak Pengajuan
        </Button>
      </div>
    </div>
  );
}
