import { useQuery } from "@tanstack/react-query";
import { userService } from "@/lib/api/services/user.service";
import type { AdminCustomersQueryParams } from "@/lib/api/services/user.service";

export function useCustomers(params?: AdminCustomersQueryParams) {
  return useQuery({
    queryKey: ["admin", "customers", params],
    queryFn: () => userService.getAdminCustomers(params),
    staleTime: 1000 * 60 * 5,
  });
}
