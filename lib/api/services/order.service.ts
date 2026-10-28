import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  Order,
  OrderDetail,
  OrderListItem,
  OrderStatus,
  CheckoutSummary,
  CreateOrderRequestBody,
  CreateOrderResponseData,
  UpdateOrderStatusRequestBody,
  CreateShipmentRequestBody,
  Shipment,
  ShipmentTracking,
  AddShipmentTrackingRequestBody,
} from "@/types";

export interface OrderListQueryParams extends ListQueryParams {
  status?: OrderStatus;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

export const orderService = {
  /** POST /checkout/summary - Preview checkout subtotal & diskon tanpa membuat order */
  async checkoutSummary(
    body: CreateOrderRequestBody
  ): Promise<ApiResponse<CheckoutSummary>> {
    return http.post<ApiResponse<CheckoutSummary>>("/checkout/summary", body);
  },

  /** POST /orders - Buat order dari cart & inisiasi Midtrans (Wajib idempotencyKey) */
  async createOrder(
    body: CreateOrderRequestBody,
    idempotencyKey: string
  ): Promise<ApiResponse<CreateOrderResponseData>> {
    return http.post<ApiResponse<CreateOrderResponseData>>("/orders", body, {
      idempotencyKey,
    });
  },

  /** GET /orders - Riwayat order milik user */
  async getOrders(
    params?: OrderListQueryParams
  ): Promise<ApiCollectionResponse<OrderListItem>> {
    return http.get<ApiCollectionResponse<OrderListItem>>("/orders", { params });
  },

  /** GET /orders/{id} - Detail order */
  async getOrderById(id: string): Promise<ApiResponse<OrderDetail>> {
    return http.get<ApiResponse<OrderDetail>>(`/orders/${id}`);
  },

  /** PATCH /orders/{id}/cancel - Batalkan order (hanya jika PENDING) */
  async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    return http.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);
  },

  /* ---------------------- Admin Endpoints ---------------------- */

  /** GET /admin/orders - List semua order */
  async getAdminOrders(
    params?: OrderListQueryParams
  ): Promise<ApiCollectionResponse<OrderListItem>> {
    return http.get<ApiCollectionResponse<OrderListItem>>("/admin/orders", {
      params,
    });
  },

  /** GET /admin/orders/{id} - Detail order (Admin view) */
  async getAdminOrderById(id: string): Promise<ApiResponse<OrderDetail>> {
    return http.get<ApiResponse<OrderDetail>>(`/admin/orders/${id}`);
  },

  /** PATCH /admin/orders/{id}/status - Ubah status fulfillment */
  async updateOrderStatus(
    id: string,
    body: UpdateOrderStatusRequestBody
  ): Promise<ApiResponse<Order>> {
    return http.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, body);
  },

  /** POST /admin/orders/{id}/shipment - Input data pengiriman */
  async createShipment(
    orderId: string,
    body: CreateShipmentRequestBody
  ): Promise<ApiResponse<Shipment>> {
    return http.post<ApiResponse<Shipment>>(
      `/admin/orders/${orderId}/shipment`,
      body
    );
  },

  /** POST /admin/shipments/{id}/trackings - Tambah entri tracking pengiriman */
  async addShipmentTracking(
    shipmentId: string,
    body: AddShipmentTrackingRequestBody
  ): Promise<ApiResponse<ShipmentTracking>> {
    return http.post<ApiResponse<ShipmentTracking>>(
      `/admin/shipments/${shipmentId}/trackings`,
      body
    );
  },
};
