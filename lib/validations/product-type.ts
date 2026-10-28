import { z } from "zod";

/**
 * Schema validasi untuk form data tipe produk (CreateProductTypeRequestBody).
 */
export const productTypeFormSchema = z.object({
  name: z.string().min(1, "Nama tipe produk wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
});

export type ProductTypeFormValues = z.infer<typeof productTypeFormSchema>;

/**
 * Helper utility untuk meng-generate slug otomatis dari nama tipe produk.
 * Sama dengan generateCategorySlug dan generateSlug di validasi lain.
 */
export function generateProductTypeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
