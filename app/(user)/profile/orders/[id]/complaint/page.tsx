"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageSquareWarning, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  product_name_snapshot: string;
  variant_name_snapshot: string | null;
}

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  order_items: OrderItem[];
}

export default function ComplaintPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [selectedItemId, setSelectedItemId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/orders/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Gagal memuat pesanan.");
        const data = json.data as OrderData;
        // Only DELIVERED or COMPLETED orders can file a complaint
        if (data.status !== "DELIVERED" && data.status !== "COMPLETED") {
          setLoadError("Komplain hanya dapat diajukan untuk pesanan yang sudah dikirim atau selesai.");
        } else {
          setOrder(data);
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Gagal memuat pesanan.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItemId || !reason.trim() || !description.trim()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_item_id: selectedItemId,
          reason: reason.trim(),
          description: description.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal mengajukan komplain.");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengajukan komplain.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="font-body text-sm">Memuat data pesanan...</span>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (loadError || !order) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="font-body text-sm text-muted-foreground">
          {loadError ?? "Pesanan tidak ditemukan."}
        </p>
        <Link href={`/profile/orders/${id}`}>
          <Button variant="outline" size="sm">Kembali ke Detail Pesanan</Button>
        </Link>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center">
        <div className="p-4 rounded-full bg-accent-green border-2 border-foreground">
          <CheckCircle2 className="w-10 h-10 text-foreground" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-xl text-foreground">
            Komplain Berhasil Dikirim
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Tim kami akan meninjau komplain Anda dan menghubungi Anda segera.
          </p>
        </div>
        <Link href={`/profile/orders/${id}`}>
          <Button variant="primary" size="sm">Kembali ke Detail Pesanan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link href={`/profile/orders/${id}`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-orange-500" />
            Ajukan Komplain
          </h1>
          <p className="font-body text-xs text-muted-foreground">
            Pesanan #{order.order_number}
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="bg-card border-2 border-foreground rounded-2xl p-6 flex flex-col gap-5"
      >
        {/* Pilih produk */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="item-select" className="font-body font-semibold text-sm text-foreground">
            Produk yang Dikomplain <span className="text-red-500">*</span>
          </label>
          <select
            id="item-select"
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            required
            className="bg-background border-2 border-foreground rounded-xl px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="" disabled>-- Pilih produk --</option>
            {order.order_items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.product_name_snapshot}
                {item.variant_name_snapshot ? ` (${item.variant_name_snapshot})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Alasan singkat */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reason-input" className="font-body font-semibold text-sm text-foreground">
            Alasan Komplain <span className="text-red-500">*</span>
          </label>
          <input
            id="reason-input"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            maxLength={150}
            placeholder="Contoh: Produk rusak saat diterima"
            className="bg-background border-2 border-foreground rounded-xl px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Deskripsi lengkap */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description-input" className="font-body font-semibold text-sm text-foreground">
            Deskripsi Lengkap <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            placeholder="Jelaskan detail masalah yang Anda alami..."
            className="bg-background border-2 border-foreground rounded-xl px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Error */}
        {submitError && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="font-body text-sm">{submitError}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSubmitting || !selectedItemId || !reason.trim() || !description.trim()}
          className="gap-2 self-end"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Mengirim..." : "Kirim Komplain"}
        </Button>
      </form>
    </div>
  );
}
