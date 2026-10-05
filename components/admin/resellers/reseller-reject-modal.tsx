"use client";

import * as React from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type RejectReason =
  | "dokumen_tidak_valid"
  | "alamat_tidak_sesuai"
  | "kuota_penuh"
  | "riwayat_tidak_cukup"
  | "lainnya";

const REJECT_REASON_OPTIONS: { value: RejectReason; label: string }[] = [
  { value: "dokumen_tidak_valid", label: "Dokumen Legalitas Tidak Terbaca / Kadaluarsa" },
  { value: "alamat_tidak_sesuai", label: "Data Alamat Belum Memenuhi Kriteria Institusi" },
  { value: "kuota_penuh", label: "Kuota Kemitraan Reseller Wilayah Penuh" },
  { value: "riwayat_tidak_cukup", label: "Riwayat Pembelian Tidak Memenuhi Syarat Minimum" },
  { value: "lainnya", label: "Alasan Lainnya (Lihat Catatan Verifikator)" },
];

export interface ResellerRejectModalProps {
  open: boolean;
  applicantName: string;
  applicantId: string;
  onClose: () => void;
  onConfirm: (reason: RejectReason, label: string) => void;
}

/**
 * Atom — Modal konfirmasi penolakan pengajuan reseller.
 * Neo-Brutalist style sesuai stitch design.
 * Menampilkan pilihan alasan penolakan wajib sebelum konfirmasi.
 */
export function ResellerRejectModal({
  open,
  applicantName,
  applicantId,
  onClose,
  onConfirm,
}: ResellerRejectModalProps) {
  const [selectedReason, setSelectedReason] = React.useState<RejectReason>("dokumen_tidak_valid");

  if (!open) return null;

  const handleConfirm = () => {
    const label =
      REJECT_REASON_OPTIONS.find((o) => o.value === selectedReason)?.label ?? selectedReason;
    onConfirm(selectedReason, label);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-danger shrink-0" />
            <h3 className="font-heading text-base font-bold text-foreground">
              Konfirmasi Penolakan
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border border-border bg-muted hover:bg-danger-bg transition-colors duration-100"
            aria-label="Tutup modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <p className="text-xs text-foreground/80 font-body leading-relaxed">
          Apakah Anda yakin ingin menolak pengajuan reseller untuk{" "}
          <strong className="font-heading font-bold">{applicantName}</strong>{" "}
          <span className="font-mono text-[10px] bg-accent-soft-blue px-1.5 py-0.5 border border-border">
            {applicantId}
          </span>
          ? Penolakan akan mengirimkan notifikasi ke pemohon via email resmi.
        </p>

        {/* Reason Select */}
        <div className="space-y-1.5">
          <label
            htmlFor="rejectReason"
            className="block font-heading text-xs font-bold text-foreground"
          >
            Alasan Penolakan (Wajib):
          </label>
          <select
            id="rejectReason"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value as RejectReason)}
            className={cn(
              "w-full border-2 border-border bg-muted px-3 py-2 text-xs font-body",
              "focus:outline-none focus:bg-card focus:shadow-[2px_2px_0px_0px_#2483D0]",
              "transition-shadow duration-100"
            )}
          >
            {REJECT_REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "border-2 border-border bg-card hover:bg-muted",
              "px-4 py-2 text-xs font-heading font-bold",
              "transition-all duration-100 active:translate-x-0.5 active:translate-y-0.5"
            )}
          >
            BATAL
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={cn(
              "border-2 border-border bg-danger-bg hover:bg-accent-pink text-danger",
              "px-4 py-2 text-xs font-heading font-bold neo-shadow neo-shadow-hover",
              "transition-all duration-100"
            )}
          >
            KONFIRMASI TOLAK
          </button>
        </div>
      </div>
    </div>
  );
}
