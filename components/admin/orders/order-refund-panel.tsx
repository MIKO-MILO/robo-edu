"use client";

import * as React from "react";
import {
  RotateCcw,
  Loader2,
  AlertTriangle,
  Upload,
  X,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/status-badge";
import { OrderInfoCard } from "./order-info-card";
import { toast } from "@/components/admin/use-toast";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/enums";
import type { Refund } from "@/types/order";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Payment types yang TIDAK mendukung Refund API Midtrans.
 * Untuk tipe ini admin harus transfer manual dan unggah bukti.
 */
const MANUAL_REFUND_PAYMENT_TYPES = new Set([
  "bank_transfer",
  "echannel", // Mandiri ePay
  "cstore",
]);

/** Apakah metode pembayaran memerlukan refund manual (upload bukti)? */
function requiresManualProof(paymentType: string): boolean {
  return MANUAL_REFUND_PAYMENT_TYPES.has(paymentType.toLowerCase());
}

/**
 * Status order yang memperbolehkan proses refund.
 */
const REFUNDABLE_STATUSES = new Set<OrderStatus>([
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
]);

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// ---------------------------------------------------------------------------
// RefundHistoryRow — satu baris riwayat refund
// ---------------------------------------------------------------------------

interface RefundHistoryRowProps {
  refund: Refund;
  orderId: string;
  onProofUploaded: (refundId: string, proofUrl: string) => void;
}

function RefundHistoryRow({ refund, orderId, onProofUploaded }: RefundHistoryRowProps) {
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleProofUpload = async (file: File) => {
    setUploading(true);
    try {
      // Upload file ke MinIO
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload/minio", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Gagal mengunggah bukti ke server.");
      }

      const uploadData = await uploadRes.json();
      const proofUrl: string = uploadData.url ?? uploadData.fileUrl;

      if (!proofUrl) throw new Error("URL bukti tidak diterima dari server.");

      // Kirim URL ke endpoint PATCH
      const patchRes = await fetch(
        `/api/admin/orders/${orderId}/refunds/${refund.id}/proof`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proof_url: proofUrl }),
        },
      );

      if (!patchRes.ok) {
        if (patchRes.status === 404 || patchRes.status === 405) {
          toast({
            variant: "warning",
            title: "Fitur belum aktif",
            description: "Endpoint unggah bukti refund belum tersedia di lingkungan ini.",
          });
          return;
        }
        const patchJson = await patchRes.json().catch(() => ({}));
        throw new Error(
          (patchJson as { message?: string }).message ?? "Gagal menyimpan bukti refund.",
        );
      }

      onProofUploaded(refund.id, proofUrl);
      toast.success("Bukti berhasil diunggah", "Bukti transfer refund telah disimpan.");
    } catch (err) {
      toast.error(
        "Gagal unggah bukti",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setUploading(false);
    }
  };

  const needsProof = refund.method === "MANUAL" && !refund.proof_url;

  return (
    <tr className="border-b border-border last:border-0 text-xs font-body">
      {/* Tanggal */}
      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
        {formatDate(refund.created_at)}
      </td>
      {/* Nominal */}
      <td className="py-2.5 px-3 font-semibold text-foreground whitespace-nowrap">
        {formatRupiah(refund.amount)}
      </td>
      {/* Alasan */}
      <td className="py-2.5 px-3 text-foreground max-w-[180px]">
        <span className="line-clamp-2">{refund.reason}</span>
      </td>
      {/* Metode */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border",
            refund.method === "AUTO"
              ? "bg-info-bg text-info border-info/30"
              : "bg-warning-bg text-warning border-warning/30",
          )}
        >
          {refund.method === "AUTO" ? "Otomatis" : "Manual"}
        </span>
      </td>
      {/* Status */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <StatusBadge status={refund.status} size="sm" />
      </td>
      {/* Bukti */}
      <td className="py-2.5 px-3">
        {refund.proof_url ? (
          <a
            href={refund.proof_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] font-semibold"
          >
            Lihat Bukti <ExternalLink className="size-3" />
          </a>
        ) : needsProof ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProofUpload(file);
                // Reset agar file yang sama bisa dipilih ulang
                e.target.value = "";
              }}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="gap-1 rounded-lg text-[11px] h-7"
            >
              {uploading ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  Mengunggah…
                </>
              ) : (
                <>
                  <Upload className="size-3" />
                  Unggah Bukti
                </>
              )}
            </Button>
          </>
        ) : (
          <span className="text-muted-foreground text-[11px]">—</span>
        )}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OrderRefundPanelProps {
  orderId: string;
  orderStatus: OrderStatus;
  /** Jumlah pembayaran dari payment.amount */
  paymentAmount: number;
  /** Tipe pembayaran dari payment.payment_type (mis. "gopay", "bank_transfer") */
  paymentType: string;
  /** Riwayat refund yang sudah ada */
  refunds: Refund[];
  /** Dipanggil setelah refund berhasil diproses (optimistic update di parent) */
  onRefundSuccess?: (newRefund: Refund) => void;
  /** Dipanggil setelah bukti berhasil diunggah */
  onProofUploaded?: (refundId: string, proofUrl: string) => void;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Panel Refund — ditampilkan di halaman detail order admin.
 *
 * Hanya muncul jika order.status ∈ {PAID, PROCESSING, SHIPPED, DELIVERED, COMPLETED}.
 *
 * Fitur:
 * - Form refund: nominal, alasan, checkbox restore_quota
 * - Upload bukti untuk metode manual (bank_transfer, cstore)
 * - Validasi sisi FE: nominal ≤ sisa belum direfund
 * - Riwayat refund dalam tabel
 * - Tombol "Unggah Bukti" untuk refund MANUAL dengan proof_url null
 * - Jika POST /admin/orders/:id/refund belum ada → toast warning "belum aktif"
 */
export function OrderRefundPanel({
  orderId,
  orderStatus,
  paymentAmount,
  paymentType,
  refunds: initialRefunds,
  onRefundSuccess,
  onProofUploaded,
}: OrderRefundPanelProps) {
  // Guard: hanya tampil untuk status refundable
  if (!REFUNDABLE_STATUSES.has(orderStatus)) return null;

  return (
    <OrderRefundPanelContent
      orderId={orderId}
      paymentAmount={paymentAmount}
      paymentType={paymentType}
      initialRefunds={initialRefunds}
      onRefundSuccess={onRefundSuccess}
      onProofUploaded={onProofUploaded}
    />
  );
}

// ---------------------------------------------------------------------------
// Inner content component
// ---------------------------------------------------------------------------

interface OrderRefundPanelContentProps {
  orderId: string;
  paymentAmount: number;
  paymentType: string;
  initialRefunds: Refund[];
  onRefundSuccess?: (newRefund: Refund) => void;
  onProofUploaded?: (refundId: string, proofUrl: string) => void;
}

function OrderRefundPanelContent({
  orderId,
  paymentAmount,
  paymentType,
  initialRefunds,
  onRefundSuccess,
  onProofUploaded,
}: OrderRefundPanelContentProps) {
  // ── Refund list — fully controlled from parent via initialRefunds ─────
  // Optimistic local additions flow up through onRefundSuccess; parent
  // updates the prop and passes it back down.
  const refunds = initialRefunds;

  // ── Computed ──────────────────────────────────────────────────────────
  const totalRefunded = refunds.reduce((acc, r) => acc + r.amount, 0);
  const remainingAmount = Math.max(0, paymentAmount - totalRefunded);

  // ── Form state ────────────────────────────────────────────────────────
  const [amount, setAmount] = React.useState<string>(
    remainingAmount > 0 ? String(remainingAmount) : String(paymentAmount),
  );
  const [reason, setReason] = React.useState("");
  const [restoreQuota, setRestoreQuota] = React.useState(false);
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [proofPreview, setProofPreview] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const proofFileInputRef = React.useRef<HTMLInputElement>(null);

  const isManual = requiresManualProof(paymentType);

  // ── Validation ────────────────────────────────────────────────────────
  const parsedAmount = Number(amount);
  const amountError =
    amount !== "" && (isNaN(parsedAmount) || parsedAmount <= 0)
      ? "Nominal harus berupa angka positif."
      : parsedAmount > remainingAmount && remainingAmount > 0
        ? `Nominal melebihi sisa yang bisa direfund (${formatRupiah(remainingAmount)}).`
        : null;

  const isFormValid =
    !amountError &&
    amount !== "" &&
    parsedAmount > 0 &&
    reason.trim().length > 0;

  // ── Proof file handlers ───────────────────────────────────────────────
  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setProofPreview(url);
    } else {
      setProofPreview(null);
    }
  };

  const handleRemoveProof = React.useCallback(() => {
    setProofFile(null);
    setProofPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (proofFileInputRef.current) proofFileInputRef.current.value = "";
  }, []);

  // Cleanup blob URL on unmount
  React.useEffect(() => {
    return () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isFormValid) return;
    setSubmitting(true);
    setFormError(null);

    try {
      let proofUrl: string | null = null;

      // Upload bukti terlebih dahulu jika metode manual dan ada file
      if (isManual && proofFile) {
        const formData = new FormData();
        formData.append("file", proofFile);

        const uploadRes = await fetch("/api/upload/minio", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Gagal mengunggah bukti transfer.");
        }

        const uploadData = await uploadRes.json();
        proofUrl = uploadData.url ?? uploadData.fileUrl ?? null;
      }

      // POST ke endpoint refund
      const payload: Record<string, unknown> = {
        amount: parsedAmount,
        reason: reason.trim(),
        restore_quota: restoreQuota,
        ...(proofUrl ? { proof_url: proofUrl } : {}),
      };

      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Endpoint belum ada → tampilkan toast informatif, jangan throw error
      if (res.status === 404 || res.status === 405) {
        toast({
          variant: "warning",
          title: "Fitur belum aktif",
          description: "Fitur refund belum aktif di lingkungan ini.",
        });
        return;
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(
          (json as { message?: string }).message ?? `HTTP ${res.status}`,
        );
      }

      const json = await res.json();
      const newRefund = json.data as Refund;

      // Optimistic: propagate up to parent
      onRefundSuccess?.(newRefund);

      // Reset form, nominal ke sisa baru
      const newRemaining = Math.max(0, remainingAmount - parsedAmount);
      setAmount(newRemaining > 0 ? String(newRemaining) : "0");
      setReason("");
      setRestoreQuota(false);
      handleRemoveProof();

      toast.success(
        "Refund berhasil diproses",
        `Nominal ${formatRupiah(parsedAmount)} telah direfund.`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setFormError(msg);
      toast.error("Gagal memproses refund", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Proof-uploaded callback (dari RefundHistoryRow) ───────────────────
  const handleProofUploaded = (refundId: string, proofUrl: string) => {
    onProofUploaded?.(refundId, proofUrl);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <OrderInfoCard icon={<RotateCcw className="size-4" />} title="Refund">
      <div className="space-y-5">
        {/* Info sisa refund */}
        <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs font-body">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Total Pembayaran</span>
            <span className="font-semibold text-foreground">{formatRupiah(paymentAmount)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Sudah Direfund</span>
            <span className="font-semibold text-warning">{formatRupiah(totalRefunded)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Sisa Dapat Direfund</span>
            <span className="font-semibold text-foreground">{formatRupiah(remainingAmount)}</span>
          </div>
        </div>

        {/* Form refund — hanya tampil jika masih ada sisa */}
        {remainingAmount > 0 ? (
          <div className="space-y-4">
            {/* Nominal */}
            <div className="space-y-1.5">
              <label
                htmlFor="refund-amount"
                className="block text-xs font-semibold text-muted-foreground font-body"
              >
                Nominal Refund (Rp)
                <span className="text-danger ml-0.5">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="refund-amount"
                  type="number"
                  min={1}
                  max={remainingAmount}
                  step={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={submitting}
                  placeholder={String(remainingAmount)}
                  className="h-9 rounded-xl text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(String(remainingAmount))}
                  disabled={submitting || Number(amount) === remainingAmount}
                  className="shrink-0 h-9 rounded-xl text-xs"
                >
                  Penuh
                </Button>
              </div>
              {amountError && (
                <p className="text-xs text-danger font-body flex items-center gap-1">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  {amountError}
                </p>
              )}
            </div>

            {/* Alasan */}
            <div className="space-y-1.5">
              <label
                htmlFor="refund-reason"
                className="block text-xs font-semibold text-muted-foreground font-body"
              >
                Alasan Refund
                <span className="text-danger ml-0.5">*</span>
              </label>
              <textarea
                id="refund-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
                placeholder="Jelaskan alasan refund..."
                className={cn(
                  "w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "transition-colors",
                )}
              />
            </div>

            {/* Checkbox: restore quota */}
            <div className="flex items-center gap-2.5">
              <input
                id="refund-restore-quota"
                type="checkbox"
                checked={restoreQuota}
                onChange={(e) => setRestoreQuota(e.target.checked)}
                disabled={submitting}
                className="size-4 rounded border-border accent-primary cursor-pointer"
              />
              <label
                htmlFor="refund-restore-quota"
                className="text-xs font-body text-foreground cursor-pointer select-none"
              >
                Kembalikan kuota produksi
              </label>
            </div>

            {/* Upload bukti — hanya untuk metode manual */}
            {isManual && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground font-body">
                  Bukti Transfer
                  <span className="ml-1.5 text-[11px] font-normal text-warning">
                    (metode {paymentType} tidak mendukung refund otomatis)
                  </span>
                </p>
                <input
                  ref={proofFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleProofFileChange}
                  disabled={submitting}
                />
                {proofFile ? (
                  <div className="relative inline-block">
                    {proofPreview ? (
                      <div className="relative size-24 rounded-xl border-2 border-border overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proofPreview}
                          alt="Preview bukti transfer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveProof}
                          aria-label="Hapus file bukti"
                          className="absolute top-1 right-1 bg-danger text-white p-0.5 rounded-full hover:bg-danger/90"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-body">
                        <CheckCircle2 className="size-4 text-success shrink-0" />
                        <span className="text-foreground truncate max-w-[180px]">
                          {proofFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveProof}
                          aria-label="Hapus file bukti"
                          className="ml-1 text-muted-foreground hover:text-danger transition-colors"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => proofFileInputRef.current?.click()}
                    disabled={submitting}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 w-full p-4 rounded-xl",
                      "border border-dashed border-border text-muted-foreground text-xs font-body cursor-pointer",
                      "hover:border-primary/70 hover:bg-muted/30 transition-all",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    <Upload className="size-5" />
                    <span>Klik untuk pilih file bukti transfer</span>
                    <span className="text-[11px]">JPG, PNG, WEBP, PDF — maks. 5MB</span>
                  </button>
                )}
              </div>
            )}

            {/* Error inline */}
            {formError && (
              <p className="text-xs text-danger font-body flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 shrink-0" />
                {formError}
              </p>
            )}

            {/* Submit */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || !isFormValid}
              className="gap-2 w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Memproses…
                </>
              ) : (
                <>
                  <RotateCcw className="size-4" />
                  Proses Refund
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Semua sudah direfund */
          <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/5 px-4 py-3 text-xs text-success font-body">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Seluruh pembayaran telah direfund.</span>
          </div>
        )}

        {/* Riwayat refund */}
        {refunds.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wide">
              Riwayat Refund
            </h4>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-xs font-body">
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground whitespace-nowrap">
                      Tanggal
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground whitespace-nowrap">
                      Nominal
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground">
                      Alasan
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground whitespace-nowrap">
                      Metode
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground whitespace-nowrap">
                      Bukti
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((refund) => (
                    <RefundHistoryRow
                      key={refund.id}
                      refund={refund}
                      orderId={orderId}
                      onProofUploaded={handleProofUploaded}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </OrderInfoCard>
  );
}
