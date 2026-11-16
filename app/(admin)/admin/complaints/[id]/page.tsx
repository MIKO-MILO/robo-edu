"use client";

import React, { use, useState, useEffect } from "react";
import { toast } from "@/components/admin/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import {
  ComplaintDetailHeader,
  ComplaintOrderInfoCard,
  ComplaintCustomerCard,
  ComplaintDescriptionCard,
  ComplaintAttachmentGallery,
  ComplaintActionPanel,
  deriveMediaType,
} from "@/components/admin/complaints";
import type { AdminComplaintDetail, AdminComplaintAttachment } from "@/components/admin/complaints";
import { complaintService } from "@/lib/api/services/complaint.service";
import type { ComplaintStatus } from "@/types/enums";

interface AdminComplaintDetailPageProps {
  params: Promise<{ id: string }>;
}

// ── Status helpers ────────────────────────────────────────────────────────────

/** Convert uppercase FE enum → lowercase backend value */
function toBackendStatus(status: ComplaintStatus): string {
  const map: Record<ComplaintStatus, string> = {
    OPEN:      "open",
    IN_REVIEW: "in_review",
    RESOLVED:  "resolved",
    REJECTED:  "closed",
  };
  return map[status] ?? status.toLowerCase();
}

/** Convert lowercase backend value → uppercase FE enum */
function toFrontendStatus(raw: string): ComplaintStatus {
  const map: Record<string, ComplaintStatus> = {
    open:      "OPEN",
    in_review: "IN_REVIEW",
    resolved:  "RESOLVED",
    closed:    "REJECTED",
  };
  return map[raw.toLowerCase()] ?? "OPEN";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminComplaintDetailPage({
  params,
}: AdminComplaintDetailPageProps) {
  const { id } = use(params);

  const [complaint, setComplaint] = useState<AdminComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch detail ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await complaintService.getAdminComplaintById(id);
        if (cancelled) return;

        const item = res.data;

        // Map attachments and derive media_type
        const attachments: AdminComplaintAttachment[] = item.attachments.map((a) => ({
          id: a.id,
          file_url: a.file_url,
          file_name: a.file_name,
          file_type: a.file_type,
          media_type: deriveMediaType(a.file_type),
          created_at: a.created_at,
        }));

        const detail: AdminComplaintDetail = {
          id: item.id,
          subject: item.subject,
          description: item.description,
          status: toFrontendStatus(item.status),
          resolution: item.resolution,
          resolved_at: item.resolved_at,
          created_at: item.created_at,
          updated_at: item.updated_at,
          customer_name: item.customer.name,
          customer_email: item.customer.email,
          customer_phone: item.customer.phone,
          product_name: item.order_item.product_name,
          order_number: item.order.order_number,
          price_snapshot: item.order_item.price_snapshot,
          attachments,
        };

        setComplaint(detail);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load complaint detail:", err);
          setError("Gagal memuat detail klaim. Silakan coba lagi.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ── Handle PATCH ────────────────────────────────────────────────────────
  const handleSubmit = async (
    newStatus: ComplaintStatus,
    resolution: string
  ) => {
    try {
      const res = await complaintService.patchAdminComplaint(id, {
        status: toBackendStatus(newStatus),
        resolution_note: resolution || undefined,
      });

      // Update local state from response
      setComplaint((prev) =>
        prev
          ? {
              ...prev,
              status: toFrontendStatus(res.data.status),
              resolution: res.data.resolution,
              resolved_at: res.data.resolved_at,
              updated_at: new Date().toISOString(),
            }
          : prev
      );

      toast({
        variant: "success",
        title: "Klaim berhasil diperbarui",
        description: `Status diubah menjadi ${newStatus}.`,
      });
    } catch (err) {
      console.error("Failed to update complaint:", err);
      toast({
        variant: "error",
        title: "Gagal memperbarui klaim",
        description: "Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.",
      });
      throw err; // re-throw so ComplaintActionPanel can reset its loading state
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 pt-1">
        <Skeleton className="h-10 w-96 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error || !complaint) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="size-4 shrink-0" />
        <span>{error ?? "Klaim tidak ditemukan."}</span>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pt-1 pb-20 md:pb-24 max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-7rem)] lg:max-h-[calc(100vh-8rem)] overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <ComplaintDetailHeader
        subject={complaint.subject}
        status={complaint.status}
        createdAt={complaint.created_at}
      />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — main content (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <ComplaintDescriptionCard description={complaint.description} />
          <ComplaintAttachmentGallery attachments={complaint.attachments} />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <ComplaintOrderInfoCard
            productName={complaint.product_name}
            orderNumber={complaint.order_number}
            priceSnapshot={complaint.price_snapshot}
          />

          <ComplaintCustomerCard
            customerName={complaint.customer_name}
            customerEmail={complaint.customer_email}
            customerPhone={complaint.customer_phone}
          />

          <ComplaintActionPanel
            currentStatus={complaint.status}
            currentResolution={complaint.resolution}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
