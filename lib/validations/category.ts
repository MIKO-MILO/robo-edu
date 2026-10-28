import { z } from "zod";

/**
 * Schema validasi untuk form data kategori (CreateCategoryRequestBody).
 */
export const categoryFormSchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

/**
 * Helper utility untuk meng-generate slug otomatis dari nama kategori.
 * Re-use logika yang sama dengan generateSlug di product.ts.
 */
export function generateCategorySlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
