import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/api/services/user.service";
import type { MembershipStatus } from "@/types";

interface UpdateMembershipStatusVariables {
  id: string;
  membership_status: MembershipStatus;
}

export function useUpdateResellerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, membership_status }: UpdateMembershipStatusVariables) =>
      userService.updateUserResellerStatus(id, membership_status),
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
