import { useQuery } from "@tanstack/react-query";
import { adminService, type ReportDateRangeParams } from "@/lib/api/services/admin.service";
import type { ApiResponse, PaymentMethodReportData } from "@/types";

export function usePaymentMethodsReport(params?: ReportDateRangeParams) {
  return useQuery<ApiResponse<PaymentMethodReportData>, Error>({
    queryKey: ["admin", "reports", "payment-methods", params],
    queryFn: () => adminService.getPaymentMethodsReport(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}
