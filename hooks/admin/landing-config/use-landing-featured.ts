import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/use-toast";

// ─────────────────────────────────────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────────────────────────────────────

export const LANDING_FEATURED_VOUCHERS_KEY = ["admin", "landing-config", "vouchers"] as const;
export const LANDING_FEATURED_REVIEWS_KEY  = ["admin", "landing-config", "reviews"]  as const;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Detail voucher yang di-embed oleh GET /api/admin/landing-config/vouchers */
export interface FeaturedVoucherDetail {
  id: string;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  minimum_purchase: number;
  maximum_discount: number | null;
  start_at: string;
  end_at: string;
  is_active: boolean;
}

/** Detail review yang di-embed oleh GET /api/admin/landing-config/reviews */
export interface FeaturedReviewDetail {
  id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
}

export interface FeaturedVoucherEntry {
  id: string;          // landing_featured_vouchers.id
  voucher_id: string;
  sort_order: number;
  created_at: string;
  voucher: FeaturedVoucherDetail;
}

export interface FeaturedReviewEntry {
  id: string;          // landing_featured_reviews.id
  review_id: string;
  sort_order: number;
  created_at: string;
  review: FeaturedReviewDetail;
}

export interface ReorderItem {
  id: string;
  sort_order: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch helpers
// ─────────────────────────────────────────────────────────────────────────────

async function fetchFeaturedVouchers(): Promise<FeaturedVoucherEntry[]> {
  const res  = await fetch("/api/admin/landing-config/vouchers", { cache: "no-store" });
  const json = await res.json() as { success: boolean; data: FeaturedVoucherEntry[]; message?: string };
  if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json.data;
}

async function fetchFeaturedReviews(): Promise<FeaturedReviewEntry[]> {
  const res  = await fetch("/api/admin/landing-config/reviews", { cache: "no-store" });
  const json = await res.json() as { success: boolean; data: FeaturedReviewEntry[]; message?: string };
  if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
  return json.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks — Vouchers
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the full list of featured voucher entries (sorted by sort_order). */
export function useLandingFeaturedVouchers() {
  return useQuery({
    queryKey: LANDING_FEATURED_VOUCHERS_KEY,
    queryFn:  fetchFeaturedVouchers,
    staleTime: 30_000,
  });
}

/** Add a voucher to the featured list. */
export function useAddFeaturedVoucher() {
  const queryClient = useQueryClient();
  const { toast }   = useToast();

  return useMutation({
    mutationFn: async (voucherId: string) => {
      const res  = await fetch("/api/admin/landing-config/vouchers", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ voucher_id: voucherId }),
      });
      const json = await res.json() as { success: boolean; data?: { id: string }; message?: string };
      if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
      return json.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LANDING_FEATURED_VOUCHERS_KEY });
      toast({
        title: "Voucher Ditampilkan",
        description: "Voucher ini akan muncul di halaman landing.",
        variant: "success",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Gagal Menambahkan",
        description: err.message,
        variant: "error",
      });
    },
  });
}

/** Remove a voucher from the featured list by its landing entry id. */
export function useRemoveFeaturedVoucher() {
  const queryClient = useQueryClient();
  const { toast }   = useToast();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const res  = await fetch(`/api/admin/landing-config/vouchers/${entryId}`, {
        method: "DELETE",
      });
      const json = await res.json() as { success: boolean; message?: string };
      if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LANDING_FEATURED_VOUCHERS_KEY });
      toast({
        title: "Voucher Dihapus dari Landing",
        description: "Voucher tidak akan lagi tampil di halaman landing.",
        variant: "success",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Gagal Menghapus",
        description: err.message,
        variant: "error",
      });
    },
  });
}

/** Reorder featured vouchers. Accepts new sorted list and derives sort_order from index. */
export function useReorderFeaturedVouchers() {
  const queryClient = useQueryClient();
  const { toast }   = useToast();

  return useMutation({
    mutationFn: async (items: ReorderItem[]) => {
      const res  = await fetch("/api/admin/landing-config/vouchers/reorder", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(items),
      });
      const json = await res.json() as { success: boolean; message?: string };
      if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LANDING_FEATURED_VOUCHERS_KEY });
      toast({
        title: "Urutan Voucher Disimpan",
        description: "Urutan tampil voucher di landing page telah diperbarui.",
        variant: "success",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Gagal Menyimpan Urutan",
        description: err.message,
        variant: "error",
      });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks — Reviews
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the full list of featured review entries (sorted by sort_order). */
export function useLandingFeaturedReviews() {
  return useQuery({
    queryKey: LANDING_FEATURED_REVIEWS_KEY,
    queryFn:  fetchFeaturedReviews,
    staleTime: 30_000,
  });
}

/** Add a review to the featured list. */
export function useAddFeaturedReview() {
  const queryClient = useQueryClient();
  const { toast }   = useToast();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res  = await fetch("/api/admin/landing-config/reviews", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ review_id: reviewId }),
      });
      const json = await res.json() as { success: boolean; data?: { id: string }; message?: string };
      if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
      return json.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LANDING_FEATURED_REVIEWS_KEY });
      toast({
        title: "Review Ditampilkan di Landing",
        description: "Review ini akan muncul di halaman landing.",
        variant: "success",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Gagal Menambahkan",
        description: err.message,
        variant: "error",
      });
    },
  });
}

/** Remove a review from the featured list by its landing entry id. */
export function useRemoveFeaturedReview() {
  const queryClient = useQueryClient();
  const { toast }   = useToast();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const res  = await fetch(`/api/admin/landing-config/reviews/${entryId}`, {
        method: "DELETE",
      });
      const json = await res.json() as { success: boolean; message?: string };
      if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LANDING_FEATURED_REVIEWS_KEY });
      toast({
        title: "Review Dihapus dari Landing",
        description: "Review tidak akan lagi tampil di halaman landing.",
        variant: "success",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Gagal Menghapus",
        description: err.message,
        variant: "error",
      });
    },
  });
}

/** Reorder featured reviews. */
export function useReorderFeaturedReviews() {
  const queryClient = useQueryClient();
  const { toast }   = useToast();

  return useMutation({
    mutationFn: async (items: ReorderItem[]) => {
      const res  = await fetch("/api/admin/landing-config/reviews/reorder", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(items),
      });
      const json = await res.json() as { success: boolean; message?: string };
      if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LANDING_FEATURED_REVIEWS_KEY });
      toast({
        title: "Urutan Review Disimpan",
        description: "Urutan tampil review di landing page telah diperbarui.",
        variant: "success",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Gagal Menyimpan Urutan",
        description: err.message,
        variant: "error",
      });
    },
  });
}
