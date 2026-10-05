"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/form/input";
import { AdminTextarea } from "@/components/admin/form/textarea";
import { AdminSelect } from "@/components/admin/form/select";
import { SaveIcon, ArrowLeftIcon, Loader2Icon } from "lucide-react";
import type { Voucher, CreateVoucherRequestBody, UpdateVoucherRequestBody } from "@/types";
import { useCreateVoucher, useUpdateVoucher } from "@/hooks/admin/vouchers";

const voucherSchema = z.object({
  code: z.string().min(3, "Kode voucher minimal 3 karakter"),
  name: z.string().min(3, "Nama voucher minimal 3 karakter"),
  description: z.string().optional(),
  discount_type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discount_value: z.coerce.number().min(1, "Nilai diskon harus lebih dari 0"),
  minimum_purchase: z.coerce.number().optional().nullable(),
  maximum_discount: z.coerce.number().optional().nullable(),
  usage_limit: z.coerce.number().optional().nullable(),
  start_at: z.string().optional().nullable(),
  end_at: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.discount_type === "PERCENTAGE" && data.discount_value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Persentase maksimal 100%",
      path: ["discount_value"],
    });
  }
  
  if (data.start_at && data.end_at) {
    const start = new Date(data.start_at).getTime();
    const end = new Date(data.end_at).getTime();
    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tanggal berakhir harus setelah tanggal mulai",
        path: ["end_at"],
      });
    }
  }
});

type VoucherFormValues = z.infer<typeof voucherSchema>;

export interface VoucherFormProps {
  initialData?: Voucher;
}

export function VoucherForm({ initialData }: VoucherFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();

  // Convert Date strings to local datetime format for input type="datetime-local"
  const formatDateForInput = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    // Format to YYYY-MM-DDThh:mm
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      description: initialData?.description || "",
      discount_type: initialData?.discount_type || "PERCENTAGE",
      discount_value: initialData?.discount_value || 0,
      minimum_purchase: initialData?.minimum_purchase || null,
      maximum_discount: initialData?.maximum_discount || null,
      usage_limit: initialData?.usage_limit || null,
      start_at: formatDateForInput(initialData?.start_at),
      end_at: formatDateForInput(initialData?.end_at),
      is_active: initialData ? initialData.is_active : true,
    },
  });

  const discountType = watch("discount_type");

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Clean up values
      const payload: CreateVoucherRequestBody = {
        code: data.code,
        name: data.name,
        description: data.description || null,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        minimum_purchase: data.minimum_purchase || null,
        maximum_discount: data.discount_type === "PERCENTAGE" ? (data.maximum_discount || null) : null,
        usage_limit: data.usage_limit || null,
        start_at: data.start_at ? new Date(data.start_at).toISOString() : null,
        end_at: data.end_at ? new Date(data.end_at).toISOString() : null,
        is_active: data.is_active,
      };

      if (isEdit && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data: payload as UpdateVoucherRequestBody });
      } else {
        await createMutation.mutateAsync(payload);
      }
      
      router.push("/admin/vouchers");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            {isEdit ? "Edit Voucher" : "Tambah Voucher Baru"}
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            {isEdit
              ? "Ubah data voucher yang sudah ada"
              : "Isi form berikut untuk membuat voucher baru"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            neo={false}
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            neo
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2Icon className="size-4 mr-2 animate-spin" />
            ) : (
              <SaveIcon className="size-4 mr-2" />
            )}
            Simpan Voucher
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Kiri */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-base text-foreground mb-4">
              Informasi Umum
            </h3>
            
            <AdminInput
              label="Kode Voucher"
              placeholder="Contoh: MERDEKA24"
              error={errors.code?.message}
              {...register("code")}
              required
            />

            <AdminInput
              label="Nama Voucher"
              placeholder="Contoh: Diskon Kemerdekaan"
              error={errors.name?.message}
              {...register("name")}
              required
            />

            <AdminTextarea
              label="Deskripsi"
              placeholder="Syarat dan ketentuan voucher..."
              error={errors.description?.message}
              {...register("description")}
              rows={3}
            />

            <div className="flex items-center justify-between pt-2">
              <div>
                <label className="text-sm font-semibold text-foreground font-body">
                  Status Voucher
                </label>
                <p className="text-xs text-muted-foreground font-body">
                  Aktifkan voucher ini agar bisa digunakan
                </p>
              </div>
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                  </label>
                )}
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-base text-foreground mb-4">
              Pengaturan Diskon & Limit
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground font-body">
                  Tipe Diskon <span className="text-danger">*</span>
                </label>
                <Controller
                  control={control}
                  name="discount_type"
                  render={({ field }) => (
                    <AdminSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      options={[
                        { value: "PERCENTAGE", label: "Persentase (%)" },
                        { value: "FIXED_AMOUNT", label: "Nominal Tetap (Rp)" },
                      ]}
                    />
                  )}
                />
              </div>

              <AdminInput
                label="Nilai Diskon"
                type="number"
                placeholder="0"
                error={errors.discount_value?.message}
                {...register("discount_value")}
                required
              />
            </div>

            <AdminInput
              label="Minimal Pembelian (Opsional)"
              type="number"
              placeholder="0"
              error={errors.minimum_purchase?.message}
              {...register("minimum_purchase")}
              helperText="Kosongkan jika tidak ada syarat minimal."
            />

            {discountType === "PERCENTAGE" && (
              <AdminInput
                label="Maksimal Diskon (Opsional)"
                type="number"
                placeholder="0"
                error={errors.maximum_discount?.message}
                {...register("maximum_discount")}
                helperText="Batas maksimal potongan untuk tipe persentase."
              />
            )}

            <AdminInput
              label="Batas Penggunaan (Opsional)"
              type="number"
              placeholder="Contoh: 100"
              error={errors.usage_limit?.message}
              {...register("usage_limit")}
              helperText="Maksimal total voucher bisa dipakai. Kosongkan jika unlimited."
            />
            
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50 mt-4">
              <AdminInput
                label="Tanggal Mulai (Opsional)"
                type="datetime-local"
                error={errors.start_at?.message}
                {...register("start_at")}
              />
              <AdminInput
                label="Tanggal Berakhir (Opsional)"
                type="datetime-local"
                error={errors.end_at?.message}
                {...register("end_at")}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
