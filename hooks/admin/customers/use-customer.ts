import { useQuery } from "@tanstack/react-query";
import { userService } from "@/lib/api/services/user.service";

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "customers", id],
    queryFn: () => {
      if (!id) throw new Error("Customer id is required");
      return userService.getAdminCustomerDetail(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
