import { useQuery } from "@tanstack/react-query";
import { adminService, type SalesDateRangeParams } from "@/lib/api/services/admin.service";
import type { ApiResponse, ListQueryParams } from "@/types";

export interface TopProductReportResult {
  product_id: string;
  product_name: string;
  total_sold: number;
  total_revenue: number;
}

export interface TopProductsReportData {
  products: TopProductReportResult[];
}

export function useTopProductsReport(
  params?: ListQueryParams & SalesDateRangeParams
) {
  return useQuery<ApiResponse<TopProductsReportData>, Error>({
    queryKey: ["admin", "reports", "top-products", params],
    queryFn: () => adminService.getTopProducts(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}
