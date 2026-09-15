import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/lib/api/services/admin.service";
import type { AdminDashboardSummary, ApiResponse } from "@/types";

export function useDashboardSummary() {
  return useQuery<ApiResponse<AdminDashboardSummary>, Error>({
    queryKey: ["admin", "dashboard-summary"],
    queryFn: () => adminService.getDashboardSummary(),
    staleTime: 1000 * 60 * 5, // 5 menit cache
    refetchOnWindowFocus: true,
  });
}
