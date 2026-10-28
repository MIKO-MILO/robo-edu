import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/api/services/user.service";

interface UpdateUserStatusVariables {
  id: string;
  is_active: boolean;
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: UpdateUserStatusVariables) =>
      userService.updateUserStatus(id, is_active),
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
