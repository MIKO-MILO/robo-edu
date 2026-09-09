import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ShippingProvider,
  Shipment,
} from "@/types";

export const shippingService = {
  /** GET /shipping-providers - List provider pengiriman aktif (untuk checkout) */
  async getShippingProviders(): Promise<ApiCollectionResponse<ShippingProvider>> {
    return http.get<ApiCollectionResponse<ShippingProvider>>("/shipping-providers");
  },

  /** GET /orders/{id}/shipment - Detail pengiriman order */
  async getOrderShipment(orderId: string): Promise<ApiResponse<Shipment>> {
    return http.get<ApiResponse<Shipment>>(`/orders/${orderId}/shipment`);
  },

  /* ---------------------- Admin Endpoints ---------------------- */

  /** POST /admin/shipping-providers - Tambah provider pengiriman */
  async createShippingProvider(body: {
    name: string;
    is_active?: boolean;
  }): Promise<ApiResponse<ShippingProvider>> {
    return http.post<ApiResponse<ShippingProvider>>(
      "/admin/shipping-providers",
      body
    );
  },

  /** PATCH /admin/shipping-providers/{id} - Update / nonaktifkan provider */
  async updateShippingProvider(
    id: string,
    body: { name?: string; is_active?: boolean }
  ): Promise<ApiResponse<ShippingProvider>> {
    return http.patch<ApiResponse<ShippingProvider>>(
      `/admin/shipping-providers/${id}`,
      body
    );
  },
};
