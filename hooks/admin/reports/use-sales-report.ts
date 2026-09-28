import { useQuery } from "@tanstack/react-query";
import { adminService, type SalesReportQueryParams } from "@/lib/api/services/admin.service";
import type { ApiCollectionResponse, SalesReportPoint } from "@/types";

export function useSalesReport(params?: SalesReportQueryParams) {
  return useQuery<ApiCollectionResponse<SalesReportPoint>, Error>({
    queryKey: ["admin", "reports", "sales", params],
    queryFn: () => adminService.getSalesReport(params),
    staleTime: 1000 * 60 * 5, // 5 menit cache
    refetchOnWindowFocus: true,
  });
}
