import { z } from "zod";

/**
 * Schema validasi untuk form data produk utama (CreateProductRequestBody).
 */
export const productFormSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  sku: z.string().min(1, "SKU produk wajib diisi"),
  category_id: z.string().min(1, "Kategori wajib dipilih"),
  product_type_id: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

/**
 * Schema validasi untuk form data variant produk (CreateVariantRequestBody).
 */
export const variantFormSchema = z.object({
  variant_name: z.string().min(1, "Nama varian wajib diisi"),
  sku: z.string().min(1, "SKU varian wajib diisi"),
  price: z.number().gt(0, "Harga harus lebih besar dari 0"),
  reseller_price: z
    .number()
    .gt(0, "Harga reseller harus lebih besar dari 0")
    .nullable()
    .optional(),
  stock: z
    .number()
    .int("Stok harus berupa bilangan bulat")
    .min(0, "Stok tidak boleh negatif"),
  weight: z
    .number()
    .gt(0, "Berat harus lebih besar dari 0")
    .nullable()
    .optional(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK"]),
});

export type VariantFormValues = z.infer<typeof variantFormSchema>;

/**
 * Helper utility untuk meng-generate slug otomatis dari nama produk.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
