"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MessageSquareWarning,
  Loader2,
  AlertCircle,
  Package,
  ShoppingCart,
  Paperclip,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Attachment {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  created_at: string;
}

interface StatusHistoryEntry {
  id: string;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface ComplaintDetail {
  id: string;
  subject: string;
  description: string;
  status: string;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  order_item: {
    id: string;
    product_name: string;
    variant_name: string | null;
    sku_snapshot: string;
    price_snapshot: number;
    quantity: number;
  };
  order: {
    id: string;
    order_number: string;
    status: string;
  };
  attachments: Attachment[];
  status_history: StatusHistoryEntry[];
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

function normalizeStatus(raw: string): string {
  const map: Record<string, string> = {
    open: "OPEN",
    in_review: "IN_REVIEW",
    resolved: "RESOLVED",
    closed: "REJECTED",
  };
  return map[raw.toLowerCase()] ?? raw.toUpperCase();
}

function isImageType(fileType: string | null, fileName: string): boolean {
  if (fileType?.startsWith("image/")) return true;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
}

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

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ComplaintDetailPage() {
  const params = useParams<{ complaintId: string }>();
  const complaintId = params?.complaintId;

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!complaintId) return;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/complaints/${complaintId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Gagal memuat detail komplain.");
        setComplaint(json.data as ComplaintDetail);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat detail komplain.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [complaintId]);

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="font-body text-sm">Memuat detail komplain...</span>
        </div>
      </div>
    );
  }

  // Error
  if (error || !complaint) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="font-body text-sm text-muted-foreground">
          {error ?? "Komplain tidak ditemukan."}
        </p>
        <Link href="/profile/complaints">
          <Button variant="outline" size="sm">Kembali ke Daftar Komplain</Button>
        </Link>
      </div>
    );
  }

  const normalizedStatus = normalizeStatus(complaint.status);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Back + Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/profile/complaints">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-orange-500 shrink-0" />
              {complaint.subject}
            </h1>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              Diajukan {formatDate(complaint.created_at, true)}
            </p>
          </div>
        </div>
        <StatusBadge status={normalizedStatus} size="md" neo />
      </div>

      {/* Detail grid */}
      <div className="flex flex-col gap-6">
        {/* Deskripsi komplain */}
        <Section
          title="Detail Komplain"
          icon={<MessageSquareWarning className="w-4 h-4 text-orange-500" />}
        >
          <p className="font-body text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {complaint.description}
          </p>

          {/* Resolution note (shown when status is resolved/closed) */}
          {complaint.resolution && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Catatan Tindak Lanjut
              </p>
              <p className="font-body text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {complaint.resolution}
              </p>
              {complaint.resolved_at && (
                <p className="font-body text-xs text-muted-foreground mt-1">
                  Diselesaikan {formatDate(complaint.resolved_at, true)}
                </p>
              )}
            </div>
          )}
        </Section>

        {/* Produk yang dikomplain */}
        <Section
          title="Produk Dikomplain"
          icon={<Package className="w-4 h-4 text-primary" />}
        >
          <div className="flex flex-col gap-1">
            <p className="font-body font-semibold text-sm text-foreground">
              {complaint.order_item.product_name}
            </p>
            {complaint.order_item.variant_name && (
              <p className="font-body text-xs text-muted-foreground">
                Varian: {complaint.order_item.variant_name}
              </p>
            )}
            <p className="font-body text-xs text-muted-foreground">
              SKU: {complaint.order_item.sku_snapshot}
            </p>
            <p className="font-body text-xs text-muted-foreground">
              {formatRupiah(complaint.order_item.price_snapshot)} × {complaint.order_item.quantity}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
            <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="font-body text-xs text-muted-foreground">Pesanan</span>
            <Link href={`/profile/orders/${complaint.order.id}`}>
              <span className="font-body text-xs text-primary font-semibold hover:underline">
                #{complaint.order.order_number}
              </span>
            </Link>
          </div>
        </Section>

        {/* Lampiran */}
        {complaint.attachments.length > 0 && (
          <Section
            title={`Lampiran (${complaint.attachments.length})`}
            icon={<Paperclip className="w-4 h-4 text-primary" />}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {complaint.attachments.map((att) =>
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
                    <span className="font-body text-xs text-foreground truncate">{att.file_name}</span>
                  </a>
                ),
              )}
            </div>
          </Section>
        )}

        {/* Riwayat status */}
        {complaint.status_history.length > 0 && (
          <Section
            title="Riwayat Status"
            icon={<Clock className="w-4 h-4 text-primary" />}
          >
            <ol className="relative border-l-2 border-border ml-2 flex flex-col gap-5">
              {complaint.status_history.map((entry) => (
                <li key={entry.id} className="pl-5 relative">
                  {/* Timeline dot */}
                  <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                  <p className="font-body text-xs text-muted-foreground">
                    {formatDate(entry.created_at, true)}
                  </p>
                  {entry.description && (
                    <p className="font-body text-sm text-foreground mt-0.5">
                      {entry.description}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        )}
      </div>
    </div>
  );
}
