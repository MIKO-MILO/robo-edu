import { useQuery } from "@tanstack/react-query";
import { adminService, type ReportDateRangeParams } from "@/lib/api/services/admin.service";
import type { ApiResponse, CategorySalesReportData } from "@/types";

export function useCategorySalesReport(params?: ReportDateRangeParams) {
  return useQuery<ApiResponse<CategorySalesReportData>, Error>({
    queryKey: ["admin", "reports", "category-sales", params],
    queryFn: () => adminService.getCategorySalesReport(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}
