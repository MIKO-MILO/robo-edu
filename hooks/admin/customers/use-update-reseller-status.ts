import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/api/services/user.service";
import type { ResellerStatus } from "@/types";

interface UpdateResellerStatusVariables {
  id: string;
  reseller_status: ResellerStatus;
}

export function useUpdateResellerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reseller_status }: UpdateResellerStatusVariables) =>
      userService.updateUserResellerStatus(id, reseller_status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "customers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "customers", variables.id],
      });
    },
  });
}
