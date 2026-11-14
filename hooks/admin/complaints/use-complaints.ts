import { useState, useEffect, useCallback } from "react";
import type { ComplaintStatus } from "@/types/enums";
import { complaintService } from "@/lib/api/services/complaint.service";
import { deriveMediaType } from "@/components/admin/complaints/complaint-attachment-gallery";
import type {
  AdminComplaintRow,
  AdminComplaintDetail,
  ComplaintStats,
} from "@/components/admin/complaints/complaint-list-types";

export interface UseComplaintsFilters {
  search?: string;
  status?: ComplaintStatus;
  page?: number;
  limit?: number;
}

/** Convert uppercase FE enum → lowercase backend value (or undefined for "ALL") */
function toBackendStatus(status?: ComplaintStatus): string | undefined {
  if (!status) return undefined;
  const map: Record<ComplaintStatus, string> = {
    OPEN:      "open",
    IN_REVIEW: "in_review",
    RESOLVED:  "resolved",
    REJECTED:  "closed",
  };
  return map[status];
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

/**
 * Hook to fetch the paginated list of admin complaints + KPI stats.
 * Calls GET /api/admin/complaints with the given filters.
 */
export function useComplaints(filters?: UseComplaintsFilters) {
  const [data, setData] = useState<AdminComplaintRow[]>([]);
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    open: 0,
    in_review: 0,
    resolved: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await complaintService.getAdminComplaints({
        search: filters?.search || undefined,
        status: toBackendStatus(filters?.status),
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 20,
      });

      const mapped: AdminComplaintRow[] = res.data.map((item) => ({
        id: item.id,
        subject: item.subject,
        customer_name: item.customer.name,
        customer_email: item.customer.email,
        customer_phone: null,
        product_name: item.order_item.product_name,
        order_number: item.order_item.id,
        status: toFrontendStatus(item.status),
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setData(mapped);
      setTotalCount(res.meta.total_count);
      setTotalPages(res.meta.total_pages);

      setStats({
        total:     res.meta.total_count,
        open:      mapped.filter((r) => r.status === "OPEN").length,
        in_review: mapped.filter((r) => r.status === "IN_REVIEW").length,
        resolved:  mapped.filter((r) => r.status === "RESOLVED").length,
      });
    } catch (err) {
      console.error("[useComplaints] fetch error:", err);
      setError("Gagal memuat daftar klaim.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.search, filters?.status, filters?.page, filters?.limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, stats, totalCount, totalPages, isLoading, error, refetch: fetch };
}

/**
 * Hook to fetch a single complaint detail by ID.
 * Calls GET /api/admin/complaints/[id].
 */
export function useComplaintDetail(id: string) {
  const [complaint, setComplaint] = useState<AdminComplaintDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await complaintService.getAdminComplaintById(id);
        if (cancelled) return;

        const item = res.data;

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
          attachments: item.attachments.map((a) => ({
            id: a.id,
            file_url: a.file_url,
            file_name: a.file_name,
            file_type: a.file_type,
            media_type: deriveMediaType(a.file_type),
            created_at: a.created_at,
          })),
        };

        setComplaint(detail);
      } catch (err) {
        if (!cancelled) {
          console.error("[useComplaintDetail] fetch error:", err);
          setError("Gagal memuat detail klaim.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  /**
   * Optimistically update local state after a successful PATCH.
   * Also accepts the new status as a backend lowercase string.
   */
  const updateComplaintStatus = (newStatus: ComplaintStatus, notes?: string) => {
    setComplaint((prev) =>
      prev
        ? {
            ...prev,
            status: newStatus,
            resolution: notes ?? prev.resolution,
          }
        : null
    );
  };

  return { complaint, isLoading, error, updateComplaintStatus };
}
