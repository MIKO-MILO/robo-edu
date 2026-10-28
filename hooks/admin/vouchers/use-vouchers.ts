import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  type GetVouchersParams,
} from "@/lib/api/endpoints/vouchers";
import { useToast } from "@/components/admin/use-toast";
import type { UUID, CreateVoucherRequestBody, UpdateVoucherRequestBody } from "@/types";

export const VOUCHERS_QUERY_KEY = ["admin", "vouchers"];

export function useVouchers(params?: GetVouchersParams) {
  return useQuery({
    queryKey: [...VOUCHERS_QUERY_KEY, params],
    queryFn: () => getVouchers(params),
  });
}

export function useVoucher(id: UUID) {
  return useQuery({
    queryKey: [...VOUCHERS_QUERY_KEY, id],
    queryFn: () => getVoucherById(id),
    enabled: !!id,
  });
}

export function useCreateVoucher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateVoucherRequestBody) => createVoucher(data),
    onSuccess: (res) => {
      if (res.success) {
        toast({
          title: "Berhasil",
          description: "Voucher berhasil ditambahkan",
          variant: "success",
        });
        queryClient.invalidateQueries({ queryKey: VOUCHERS_QUERY_KEY });
      }
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menambahkan voucher",
        variant: "error",
      });
    },
  });
}

export function useUpdateVoucher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: UUID; data: UpdateVoucherRequestBody }) =>
      updateVoucher(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast({
          title: "Berhasil",
          description: "Voucher berhasil diperbarui",
          variant: "success",
        });
        queryClient.invalidateQueries({ queryKey: VOUCHERS_QUERY_KEY });
      }
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui voucher",
        variant: "error",
      });
    },
  });
}

export function useDeleteVoucher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: UUID) => deleteVoucher(id),
    onSuccess: (res) => {
      if (res.success) {
        toast({
          title: "Berhasil",
          description: res.data.message || "Voucher berhasil dihapus",
          variant: "success",
        });
        queryClient.invalidateQueries({ queryKey: VOUCHERS_QUERY_KEY });
      }
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus voucher",
        variant: "error",
      });
    },
  });
}
