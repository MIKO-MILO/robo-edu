import { useState, useEffect } from "react";
import type { ComplaintStatus } from "@/types/enums";
import {
  MOCK_ADMIN_COMPLAINTS,
  getMockComplaintDetail,
  getComplaintStats,
} from "@/components/admin/complaints/mock-data";
import type {
  AdminComplaintRow,
  AdminComplaintDetail,
  ComplaintStats,
} from "@/components/admin/complaints/complaint-list-types";

export interface UseComplaintsFilters {
  search?: string;
  status?: ComplaintStatus;
}

/**
 * Hook to fetch and filter the list of admin complaints & stats.
 * Currently uses mock data; replace queryFn with TanStack Query or API endpoint when backend is connected.
 */
export function useComplaints(filters?: UseComplaintsFilters) {
  const [data, setData] = useState<AdminComplaintRow[]>([]);
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    open: 0,
    in_review: 0,
    resolved: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);

    let result = [...MOCK_ADMIN_COMPLAINTS];

    if (filters?.status) {
      result = result.filter((item) => item.status === filters.status);
    }

    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.subject.toLowerCase().includes(q) ||
          item.customer_name.toLowerCase().includes(q) ||
          item.product_name.toLowerCase().includes(q)
      );
    }

    setData(result);
    setStats(getComplaintStats());
    setIsLoading(false);
  }, [filters?.search, filters?.status]);

  return {
    data,
    stats,
    isLoading,
  };
}

/**
 * Hook to fetch a single complaint detail by ID.
 * Currently uses mock data; replace queryFn with TanStack Query or API endpoint when backend is connected.
 */
export function useComplaintDetail(id: string) {
  const [complaint, setComplaint] = useState<AdminComplaintDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const detail = getMockComplaintDetail(id);
    setComplaint(detail || null);
    setIsLoading(false);
  }, [id]);

  const updateComplaintStatus = (newStatus: ComplaintStatus, notes?: string) => {
    if (!complaint) return;
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

  return {
    complaint,
    isLoading,
    updateComplaintStatus,
  };
}
