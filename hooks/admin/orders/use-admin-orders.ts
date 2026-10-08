import { useQuery } from "@tanstack/react-query";

export interface AdminOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  item_count: number;
  first_item_name: string;
  first_item_image: string | null;
  created_at: string;
}

export interface AdminOrdersMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface AdminOrdersResult {
  data: AdminOrderRow[];
  meta: AdminOrdersMeta;
}

export interface UseAdminOrdersParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

async function fetchAdminOrders(
  params: UseAdminOrdersParams,
): Promise<AdminOrdersResult> {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.status && params.status !== "ALL") sp.set("status", params.status);
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));

  const res = await fetch(`/api/admin/orders?${sp.toString()}`);
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { message?: string }).message ?? "Gagal memuat pesanan.");
  }
  const json = await res.json();
  return { data: json.data, meta: json.meta };
}

export const ADMIN_ORDERS_QUERY_KEY = ["admin", "orders"] as const;

export function useAdminOrders(params: UseAdminOrdersParams = {}) {
  return useQuery({
    queryKey: [...ADMIN_ORDERS_QUERY_KEY, params],
    queryFn: () => fetchAdminOrders(params),
    staleTime: 30_000, // 30s — cukup fresh untuk list pesanan
    placeholderData: (prev) => prev, // jangan flash kosong saat ganti filter
  });
}
