import { useQuery } from "@tanstack/react-query";
import { adminService, type ReportDateRangeParams } from "@/lib/api/services/admin.service";
import type { ApiResponse, OrderStatusReportData } from "@/types";

export function useOrderStatusReport(params?: ReportDateRangeParams) {
  return useQuery<ApiResponse<OrderStatusReportData>, Error>({
    queryKey: ["admin", "reports", "order-status", params],
    queryFn: () => adminService.getOrderStatusReport(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}
