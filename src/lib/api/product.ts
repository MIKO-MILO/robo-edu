import type { ProductResponse } from "@/types/product";

export type ProductQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  productType?: string;
  sort?:
    | "newest"
    | "oldest"
    | "name_asc"
    | "name_desc"
    | "price_asc"
    | "price_desc";
};

export async function getProducts(
  params: ProductQuery = {},
): Promise<ProductResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.productType) {
    searchParams.set("productType", params.productType);
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  const query = searchParams.toString();

  const isServer = typeof window === "undefined";
  // On the server, prefer INTERNAL_APP_URL (Docker: http://app:3000) for
  // server-to-server fetches. Falls back to NEXT_PUBLIC_APP_URL, then
  // localhost so plain `next dev` works without any extra config.
  const rawBase = isServer
    ? (process.env.INTERNAL_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    : "";
  // Strip trailing slash so the path concat never produces double slashes.
  const baseUrl = rawBase.replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/api/product${query ? `?${query}` : ""}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil produk");
  }

  return response.json();
}
