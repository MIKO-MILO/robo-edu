"use client";

import React, { use, useState } from "react";
import { toast } from "@/components/admin/use-toast";
import {
  ComplaintDetailHeader,
  ComplaintOrderInfoCard,
  ComplaintCustomerCard,
  ComplaintDescriptionCard,
  ComplaintAttachmentGallery,
  ComplaintActionPanel,
  getMockComplaintDetail,
} from "@/components/admin/complaints";
import type { ComplaintStatus } from "@/types/enums";
import type { AdminComplaintDetail } from "@/components/admin/complaints";

interface AdminComplaintDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminComplaintDetailPage({
  params,
}: AdminComplaintDetailPageProps) {
  const { id } = use(params);

  // State: mutable local copy so UI reflects changes before API is wired
  const [complaint, setComplaint] = useState<AdminComplaintDetail>(() =>
    getMockComplaintDetail(id)
  );

  /**
   * Handler tindak lanjut — akan dihubungkan ke API PATCH /admin/complaints/{id}
   * saat backend siap. Saat ini hanya memutasi state lokal + toast notifikasi.
   */
  const handleSubmit = async (
    newStatus: ComplaintStatus,
    resolution: string
  ) => {
    // Simulasi network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setComplaint((prev) => ({
      ...prev,
      status: newStatus,
      resolution: resolution || null,
      updated_at: new Date().toISOString(),
      resolved_at:
        newStatus === "RESOLVED" || newStatus === "REJECTED"
          ? new Date().toISOString()
          : prev.resolved_at,
    }));

    toast({
      variant: "success",
      title: "Klaim berhasil diperbarui",
      description: `Status diubah menjadi ${newStatus}.`,
    });
  };

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
          {/* Kronologi klaim */}
          <ComplaintDescriptionCard description={complaint.description} />

          {/* Lampiran foto / video */}
          <ComplaintAttachmentGallery attachments={complaint.attachments} />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Order item info */}
          <ComplaintOrderInfoCard
            productName={complaint.product_name}
            orderNumber={complaint.order_number}
            priceSnapshot={complaint.price_snapshot}
          />

          {/* Customer contact */}
          <ComplaintCustomerCard
            customerName={complaint.customer_name}
            customerEmail={complaint.customer_email}
            customerPhone={complaint.customer_phone}
          />

          {/* Status + resolution panel */}
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
