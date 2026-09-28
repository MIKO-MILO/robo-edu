import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/lib/api/services/admin.service";
import type { ApiCollectionResponse, ListQueryParams } from "@/types";

export interface TopProductReportResult {
  product_id: string;
  name: string;
  total_sold: number;
}

export function useTopProductsReport(params?: ListQueryParams) {
  return useQuery<ApiCollectionResponse<TopProductReportResult>, Error>({
    queryKey: ["admin", "reports", "top-products", params],
    queryFn: () => adminService.getTopProducts(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}
