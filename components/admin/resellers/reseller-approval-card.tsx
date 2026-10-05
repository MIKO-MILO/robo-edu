"use client";

import * as React from "react";
import { Gavel, CheckCircle2, XCircle, Info, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResellerStatus } from "@/types/enums";

export interface ResellerApprovalCardProps {
  resellerStatus: ResellerStatus;
  applicantName: string;
  onApprove?: () => void;
  onReject?: () => void;
}

/**
 * Molecule — Kartu Keputusan Verifikasi pengajuan reseller (Neo-Brutalist).
 * State-based rendering:
 *   - PENDING: form catatan verifikator + tombol approve/reject
 *   - APPROVED: read-only card status berhasil
 *   - REJECTED: read-only card status ditolak
 *
 * FR-010 / FR-017 (PRD): Persetujuan mengaktifkan hak reseller_price.
 * Aksi dicatat di audit_log — handled by backend on Phase 2.
 */
export function ResellerApprovalCard({
  resellerStatus,
  applicantName,
  onApprove,
  onReject,
}: ResellerApprovalCardProps) {
  const [notes, setNotes] = React.useState("");

  // ── APPROVED state ──
  if (resellerStatus === "APPROVED") {
    return (
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-success-bg flex items-center justify-between rounded-t-2xl">
          <h2 className="font-heading text-sm md:text-base font-bold flex items-center gap-2 text-success">
            <ShieldCheck className="size-[18px]" />
            Status Reseller
          </h2>
          <span className="border border-border bg-card text-[10px] font-mono px-2 py-0.5 font-bold text-foreground">
            APPROVED
          </span>
        </div>
        <div className="p-5 space-y-3">
          <div className="p-3.5 border border-border rounded-xl bg-success-bg flex items-start gap-2.5">
            <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
            <p className="text-xs font-body text-foreground leading-relaxed">
              <strong className="font-heading">{applicantName}</strong> telah mendapatkan akses harga{" "}
              <code className="font-mono bg-muted px-1 py-0.5 border border-border">reseller_price</code>{" "}
              di seluruh katalog RoboEdu.
            </p>
          </div>
          <div className="p-3 border border-border rounded-xl bg-muted text-xs text-muted-foreground font-body">
            Event telah ditulis ke tabel{" "}
            <code className="font-mono text-foreground">audit_log</code> secara otomatis.
          </div>
        </div>
      </div>
    );
  }

  // ── REJECTED state ──
  if (resellerStatus === "REJECTED") {
    return (
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-danger-bg flex items-center justify-between rounded-t-2xl">
          <h2 className="font-heading text-sm md:text-base font-bold flex items-center gap-2 text-danger">
            <XCircle className="size-[18px]" />
            Status Verifikasi
          </h2>
          <span className="border border-border bg-card text-[10px] font-mono px-2 py-0.5 font-bold text-foreground">
            REJECTED
          </span>
        </div>
        <div className="p-5 space-y-3">
          <div className="p-3.5 border border-border rounded-xl bg-danger-bg flex items-start gap-2.5">
            <XCircle className="size-5 text-danger shrink-0 mt-0.5" />
            <p className="text-xs font-body text-foreground leading-relaxed">
              Pengajuan dari <strong className="font-heading">{applicantName}</strong> telah ditolak.
              Customer tetap berstatus pelanggan reguler dengan harga normal.
            </p>
          </div>
          <div className="p-3 border border-border rounded-xl bg-muted text-xs text-muted-foreground font-body">
            Notifikasi email penolakan telah terkirim ke pemohon.
          </div>
        </div>
      </div>
    );
  }

  // ── PENDING state — action form ──
  return (
    <div className="border border-border rounded-2xl bg-card relative overflow-hidden">
      {/* Blue header */}
      <div className="p-4 border-b border-border bg-primary flex items-center justify-between rounded-t-2xl">
        <h2 className="font-heading text-sm md:text-base font-bold flex items-center gap-2 text-white">
          <Gavel className="size-[18px]" />
          Keputusan Verifikasi
        </h2>
        <span className="border border-white/50 bg-white/10 text-white text-[10px] font-mono px-2 py-0.5 font-bold">
          FR-010 / FR-017
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Info callout */}
        <div className="p-3.5 border border-border rounded-xl bg-warning-bg flex items-start gap-2.5">
          <Info className="size-5 text-warning shrink-0 mt-0.5" />
          <p className="text-xs font-body text-foreground leading-tight">
            Persetujuan akan mengaktifkan hak harga{" "}
            <strong className="font-mono">reseller_price</strong> di seluruh katalog RoboEdu dan
            secara otomatis menulis event ke tabel{" "}
            <strong className="font-mono">audit_log</strong>.
          </p>
        </div>

        {/* Notes textarea */}
        <div className="space-y-1.5">
          <label
            htmlFor="adminNotes"
            className="block font-heading text-xs font-bold text-foreground"
          >
            Catatan Verifikator / Alasan Keputusan:
          </label>
          <textarea
            id="adminNotes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Dokumen legalitas valid, total omzet melebihi standar minimum institusi."
            className={cn(
              "w-full border-2 border-border bg-muted p-3 text-xs md:text-sm font-body",
              "focus:outline-none focus:bg-card focus:shadow-[2px_2px_0px_0px_#2483D0]",
              "transition-shadow duration-100 resize-none"
            )}
          />
        </div>

        {/* Action buttons stack */}
        <div className="grid grid-cols-1 gap-3 pt-1">
          <button
            type="button"
            onClick={onApprove}
            className={cn(
              "border-2 border-border neo-shadow bg-primary hover:bg-primary-600 text-white",
              "py-3 px-4 font-heading text-xs md:text-sm font-bold",
              "flex items-center justify-center gap-2",
              "neo-shadow-hover transition-all duration-100"
            )}
          >
            <CheckCircle2 className="size-5" />
            SETUJUI RESELLER (APPROVED)
          </button>
          <button
            type="button"
            onClick={onReject}
            className={cn(
              "border-2 border-border neo-shadow bg-danger-bg hover:bg-accent-pink text-danger",
              "py-2.5 px-4 font-heading text-xs font-bold",
              "flex items-center justify-center gap-2",
              "neo-shadow-hover transition-all duration-100"
            )}
          >
            <XCircle className="size-5" />
            TOLAK PENGAJUAN (REJECTED)
          </button>
        </div>

        {/* Audit trail live preview placeholder */}
        <div className="p-3 border border-border rounded-xl bg-muted flex items-start gap-2 text-xs font-body text-muted-foreground">
          <Clock className="size-4 shrink-0 mt-0.5" />
          <span>
            Tindakan akan dicatat di <code className="font-mono text-foreground">audit_log</code>{" "}
            dengan timestamp dan ID admin secara otomatis.
          </span>
        </div>
      </div>
    </div>
  );
}
