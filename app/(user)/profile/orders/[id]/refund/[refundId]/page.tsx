"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  RefreshCcw,
  Loader2,
  AlertCircle,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";

// ── Types ──────────────────────────────────────────────────────────────────────

interface RefundAttachment {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  created_at: string;
}

interface RefundDetail {
  id: string;
  order_id: string;
  order_number: string;
  amount: number;
  reason: string;
  method: "MIDTRANS_API" | "MANUAL";
  proof_url: string | null;
  restore_quota: boolean;
  status: "PENDING" | "SUCCESS" | "FAILED";
  created_at: string;
  updated_at: string;
  attachments: RefundAttachment[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string, withTime = false) {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  };
  const result = new Intl.DateTimeFormat("id-ID", opts).format(d);
  return withTime ? `${result} WIB` : result;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function isImageType(fileType: string | null, fileName: string): boolean {
  if (fileType?.startsWith("image/")) return true;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
}

const METHOD_LABELS: Record<string, string> = {
  MIDTRANS_API: "Otomatis (Midtrans)",
  MANUAL: "Transfer Manual",
};

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border-2 border-foreground rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b-2 border-foreground bg-muted/30">
        {icon}
        <h2 className="font-heading font-bold text-sm text-foreground">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-border last:border-0">
      <span className="font-body text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="font-body text-sm text-foreground text-right">{children}</div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function RefundDetailPage() {
  const params = useParams<{ id: string; refundId: string }>();
  const orderId = params?.id;
  const refundId = params?.refundId;

  const [refund, setRefund] = useState<RefundDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !refundId) return;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${orderId}/refund/${refundId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Gagal memuat detail refund.");
        setRefund(json.data as RefundDetail);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat detail refund.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [orderId, refundId]);

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="font-body text-sm">Memuat detail refund...</span>
        </div>
      </div>
    );
  }

  // Error
  if (error || !refund) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="font-body text-sm text-muted-foreground">
          {error ?? "Data refund tidak ditemukan."}
        </p>
        <Link href={`/profile/orders/${orderId}`}>
          <Button variant="outline" size="sm">Kembali ke Detail Pesanan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      {/* Back + Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/orders/${orderId}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-blue-500 shrink-0" />
              Detail Refund
            </h1>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              Pesanan #{refund.order_number} · Diajukan {formatDate(refund.created_at, true)}
            </p>
          </div>
        </div>
        <StatusBadge status={refund.status} size="md" neo />
      </div>

      {/* Info card */}
      <Section
        title="Informasi Refund"
        icon={<RefreshCcw className="w-4 h-4 text-blue-500" />}
      >
        <InfoRow label="Status">
          <StatusBadge status={refund.status} size="sm" neo />
        </InfoRow>
        <InfoRow label="Nominal Refund">
          <span className="font-heading font-bold text-primary">
            {formatRupiah(refund.amount)}
          </span>
        </InfoRow>
        <InfoRow label="Metode">
          {METHOD_LABELS[refund.method] ?? refund.method}
        </InfoRow>
        <InfoRow label="Tanggal Pengajuan">
          {formatDate(refund.created_at, true)}
        </InfoRow>
        <InfoRow label="Terakhir Diperbarui">
          {formatDate(refund.updated_at, true)}
        </InfoRow>
      </Section>

      {/* Alasan */}
      <Section
        title="Alasan Pengembalian"
        icon={<RefreshCcw className="w-4 h-4 text-muted-foreground" />}
      >
        <p className="font-body text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {refund.reason}
        </p>
      </Section>

      {/* Bukti transfer (manual refund) */}
      {refund.proof_url && (
        <Section
          title="Bukti Transfer"
          icon={<Paperclip className="w-4 h-4 text-primary" />}
        >
          {isImageType(null, refund.proof_url) ? (
            <a href={refund.proof_url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={refund.proof_url}
                alt="Bukti transfer"
                className="max-h-72 rounded-xl border-2 border-foreground object-contain"
              />
            </a>
          ) : (
            <a
              href={refund.proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              Lihat Bukti Transfer
            </a>
          )}
        </Section>
      )}

      {/* Lampiran dari pengaju */}
      {refund.attachments.length > 0 && (
        <Section
          title={`Lampiran (${refund.attachments.length})`}
          icon={<Paperclip className="w-4 h-4 text-primary" />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {refund.attachments.map((att) =>
              isImageType(att.file_type, att.file_name) ? (
                <a
                  key={att.id}
                  href={att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl overflow-hidden border-2 border-foreground hover:border-primary transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.file_url}
                    alt={att.file_name}
                    className="w-full h-28 object-cover"
                  />
                </a>
              ) : (
                <a
                  key={att.id}
                  href={att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-3 rounded-xl border-2 border-foreground hover:border-primary transition-colors bg-muted/30"
                >
                  <Paperclip className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-body text-xs text-foreground truncate">
                    {att.file_name}
                  </span>
                </a>
              ),
            )}
          </div>
        </Section>
      )}
    </div>
  );
}
