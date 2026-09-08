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
  const baseUrl = isServer ? "http://app:3000" : "";
  const response = await fetch(`${baseUrl}/api/product${query ? `?${query}` : ""}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil produk");
  }

  return response.json();
}
