"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageSquareWarning,
  Loader2,
  AlertCircle,
  Paperclip,
  X,
  FileImage,
  FileText,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────────

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

interface AttachmentFile {
  /** Client-side key for React keys */
  localId: string;
  file: File;
  /** URL returned by /api/upload/complaint-image after successful upload */
  uploadedUrl: string | null;
  /** true while the upload request is in-flight */
  isUploading: boolean;
  /** Error message if upload failed */
  uploadError: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);
const ALLOWED_LABEL = "JPEG, PNG, WEBP, GIF, PDF";

// ── Helpers ────────────────────────────────────────────────────────────────────

function isImage(file: File) {
  return file.type.startsWith("image/");
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Page ───────────────────────────────────────────────────────────────────────

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
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [addFileError, setAddFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch order ────────────────────────────────────────────────────────────

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
        if (data.status !== "DELIVERED" && data.status !== "COMPLETED") {
          router.replace(`/profile/orders/${id}`);
          return;
        }
        setOrder(data);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Gagal memuat pesanan.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, router]);

  // ── File picker ────────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddFileError(null);
    const selected = Array.from(e.target.files ?? []);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) return;

    for (const file of selected.slice(0, remaining)) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        setAddFileError(`Tipe file "${file.name}" tidak didukung. Gunakan ${ALLOWED_LABEL}.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setAddFileError(`File "${file.name}" melebihi batas 10 MB.`);
        return;
      }

      const localId = crypto.randomUUID();
      const entry: AttachmentFile = {
        localId,
        file,
        uploadedUrl: null,
        isUploading: true,
        uploadError: null,
      };

      setAttachments((prev) => [...prev, entry]);

      // Start upload immediately in background
      void uploadFile(localId, file);
    }
  }

  async function uploadFile(localId: string, file: File) {
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload/complaint-image", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error((json as { message?: string }).message ?? "Gagal mengunggah file.");

      setAttachments((prev) =>
        prev.map((a) =>
          a.localId === localId
            ? { ...a, isUploading: false, uploadedUrl: (json as { url: string }).url }
            : a,
        ),
      );
    } catch (err) {
      setAttachments((prev) =>
        prev.map((a) =>
          a.localId === localId
            ? {
                ...a,
                isUploading: false,
                uploadError: err instanceof Error ? err.message : "Gagal mengunggah.",
              }
            : a,
        ),
      );
    }
  }

  function removeAttachment(localId: string) {
    setAttachments((prev) => prev.filter((a) => a.localId !== localId));
    setAddFileError(null);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const anyUploading = attachments.some((a) => a.isUploading);
  const anyUploadFailed = attachments.some((a) => a.uploadError !== null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItemId || !reason.trim() || !description.trim()) return;
    if (anyUploading || anyUploadFailed) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Build attachments payload — only files that uploaded successfully
    const successfulAttachments = attachments
      .filter((a) => a.uploadedUrl !== null)
      .map((a) => ({
        file_url: a.uploadedUrl!,
        file_name: a.file.name,
        file_type: a.file.type || null,
      }));

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_item_id: selectedItemId,
          reason: reason.trim(),
          description: description.trim(),
          attachments: successfulAttachments.length > 0 ? successfulAttachments : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error((json as { message?: string }).message ?? "Gagal mengajukan komplain.");
      toast.success("Komplain berhasil dikirim!", {
        description: "Tim kami akan meninjau dan menghubungi Anda segera.",
      });
      setTimeout(() => {
        router.push(`/profile/orders/${id}`);
      }, 300);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengajukan komplain.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

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

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="font-body text-sm text-muted-foreground">{loadError}</p>
        <Link href={`/profile/orders/${id}`}>
          <Button variant="outline" size="sm">Kembali ke Detail Pesanan</Button>
        </Link>
      </div>
    );
  }

  if (!order) return null;

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
          <label
            htmlFor="item-select"
            className="font-body font-semibold text-sm text-foreground"
          >
            Produk yang Dikomplain <span className="text-red-500">*</span>
          </label>
          <select
            id="item-select"
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            required
            disabled={isSubmitting}
            className="bg-background border-2 border-foreground rounded-xl px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
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
          <label
            htmlFor="reason-input"
            className="font-body font-semibold text-sm text-foreground"
          >
            Alasan Komplain <span className="text-red-500">*</span>
          </label>
          <input
            id="reason-input"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            maxLength={150}
            disabled={isSubmitting}
            placeholder="Contoh: Produk rusak saat diterima"
            className="bg-background border-2 border-foreground rounded-xl px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          />
        </div>

        {/* Deskripsi lengkap */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description-input"
            className="font-body font-semibold text-sm text-foreground"
          >
            Deskripsi Lengkap <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            disabled={isSubmitting}
            placeholder="Jelaskan detail masalah yang Anda alami..."
            className="bg-background border-2 border-foreground rounded-xl px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-60"
          />
        </div>

        {/* ── Attachment upload ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-body font-semibold text-sm text-foreground">
              Lampiran{" "}
              <span className="font-normal text-muted-foreground">
                (Opsional · maks {MAX_ATTACHMENTS} file · maks 10 MB/file)
              </span>
            </span>
            <span className="text-xs text-muted-foreground font-body">
              {attachments.length}/{MAX_ATTACHMENTS}
            </span>
          </div>

          {/* File list */}
          {attachments.length > 0 && (
            <div className="flex flex-col gap-2">
              {attachments.map((att) => (
                <div
                  key={att.localId}
                  className={[
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-colors",
                    att.uploadError
                      ? "border-red-300 bg-red-50"
                      : att.isUploading
                        ? "border-foreground/40 bg-muted/30 animate-pulse"
                        : "border-foreground bg-muted/20",
                  ].join(" ")}
                >
                  {/* File icon */}
                  <div className="shrink-0">
                    {isImage(att.file) ? (
                      <FileImage className="w-5 h-5 text-primary" />
                    ) : (
                      <FileText className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-foreground truncate">{att.file.name}</p>
                    <p className="font-body text-xs text-muted-foreground">
                      {formatBytes(att.file.size)}
                      {att.isUploading && (
                        <span className="ml-1.5 text-primary">· Mengunggah…</span>
                      )}
                      {att.uploadedUrl && !att.isUploading && (
                        <span className="ml-1.5 text-emerald-600">· Terunggah</span>
                      )}
                      {att.uploadError && (
                        <span className="ml-1.5 text-red-500">· {att.uploadError}</span>
                      )}
                    </p>
                  </div>

                  {/* Spinner or remove */}
                  {att.isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.localId)}
                      disabled={isSubmitting}
                      className="shrink-0 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-red-100 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-60"
                      aria-label="Hapus lampiran"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add file button */}
          {attachments.length < MAX_ATTACHMENTS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || anyUploading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-dashed border-foreground hover:bg-muted transition-colors text-sm font-body text-muted-foreground disabled:opacity-60 cursor-pointer w-full justify-center"
            >
              <Upload className="w-4 h-4" />
              Tambah Lampiran
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />

          {/* File picker error */}
          {addFileError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {addFileError}
            </div>
          )}

          {/* Upload-failed warning */}
          {anyUploadFailed && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Beberapa file gagal diunggah. Hapus dan coba lagi, atau lanjutkan tanpa lampiran tersebut.
            </div>
          )}
        </div>

        {/* Submit error */}
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
          disabled={
            isSubmitting ||
            anyUploading ||
            anyUploadFailed ||
            !selectedItemId ||
            !reason.trim() ||
            !description.trim()
          }
          className="gap-2 self-end"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {anyUploading ? "Mengunggah lampiran…" : isSubmitting ? "Mengirim..." : "Kirim Komplain"}
        </Button>
      </form>
    </div>
  );
}
