import type { UUID, ISODateString, Money } from "./common";
import type { OrderStatus, PaymentStatus, ShipmentStatus } from "./enums";

/**
 * order.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `order`, `order_item`, `payment`, `shipment`,
 * `shipment_tracking`, `shipping_provider`.
 *
 * CATATAN PENTING soal shipment (lihat api.md §18 poin 1 — INI SALAH
 * SATU DARI 3 DISKREPANSI YANG BELUM DIPUTUSKAN):
 * Tipe di bawah mengikuti KODEBASE, yaitu shipment sebagai tabel
 * terpisah (`Shipment` + `ShipmentTracking`), BUKAN kolom langsung di
 * `order` seperti di PRD Bab 25.4. Kalau keputusan akhir berubah ikut
 * PRD, interface `Shipment`, `ShipmentTracking`, dan bagian shipment
 * di `OrderDetail` di file ini WAJIB direvisi bareng schema.ts.
 *
 * Juga perhatikan: tabel `order` di kodebase menyimpan snapshot alamat
 * pengiriman LANGSUNG di kolom order (recipient_name, shipping_address,
 * dst) SEKALIGUS referensi `address_id` ke user_address — supaya kalau
 * user_address diedit/dihapus, histori order tidak ikut berubah.
 * ------------------------------------------------------------------
 */

export interface Order {
  id: UUID;
  order_number: string;
  user_id: UUID;
  address_id: UUID;
  voucher_id: UUID | null;
  subtotal: Money;
  discount_amount: Money;
  shipping_cost: Money;
  total: Money;
  voucher_code_snapshot: string | null;
  status: OrderStatus;
  // Snapshot alamat pengiriman pada saat order dibuat:
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_province: string;
  shipping_city: string;
  shipping_district: string;
  shipping_village: string | null;
  shipping_postal_code: string | null;
  paid_at: ISODateString | null;
  shipped_at: ISODateString | null;
  delivered_at: ISODateString | null;
  completed_at: ISODateString | null;
  cancelled_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  variant_id: UUID | null;
  /** Snapshot — tidak berubah walau produk/variant aslinya diubah/dihapus
   * setelahnya (PRD Bab 13.3). Ini yang dipakai untuk validasi review & klaim. */
  product_name_snapshot: string;
  variant_name_snapshot: string | null;
  sku_snapshot: string;
  price_snapshot: Money;
  quantity: number;
  subtotal: Money;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Payment {
  id: UUID;
  order_id: UUID;
  transaction_id: string; // ID transaksi Midtrans
  payment_type: string; // mis. "gopay", "bank_transfer"
  status: PaymentStatus;
  amount: Money;
  transaction_time: ISODateString | null;
  settlement_time: ISODateString | null;
  expiry_time: ISODateString | null;
  fraud_status: string | null;
  /** Payload mentah webhook Midtrans. Isinya bebas (JSON), jangan
   * ditampilkan langsung ke customer — hanya untuk admin/debug. */
  raw_response: Record<string, unknown> | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ShippingProvider {
  id: UUID;
  name: string; // mis. "J&T"
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Shipment {
  id: UUID;
  order_id: UUID;
  shipping_provider_id: UUID;
  service: string | null; // mis. "REG", "YES"
  tracking_number: string | null; // nomor resi
  status: ShipmentStatus;
  shipped_at: ISODateString | null;
  delivered_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ShipmentTracking {
  id: UUID;
  shipment_id: UUID;
  status: ShipmentStatus;
  description: string | null;
  location: string | null;
  occurred_at: ISODateString;
  created_at: ISODateString;
}

/* ------------------------------------------------------------------
 * DTO gabungan sesuai contoh response di api.md §10-12.
 * ------------------------------------------------------------------ */

/** Response data — GET /orders/{id} (order_items + payment + shipment sekaligus) */
export interface OrderDetail extends Order {
  order_items: OrderItem[];
  payment: Pick<Payment, "status" | "payment_type" | "amount" | "transaction_time"> | null;
  shipment: (Pick<Shipment, "tracking_number" | "status" | "shipped_at" | "delivered_at"> & {
    provider_name: string;
    trackings: ShipmentTracking[];
  }) | null;
}

/** Body — POST /checkout/summary DAN POST /orders (api.md §10) */
export interface CreateOrderRequestBody {
  address_id: UUID;
  shipping_provider_id: UUID;
  shipping_service: string;
  voucher_code?: string;
}

/** Response data — POST /checkout/summary (preview, TANPA membuat order) */
export interface CheckoutSummary {
  subtotal: Money;
  shipping_cost: Money;
  discount_amount: Money;
  total: Money;
  items: Array<{
    product_id: UUID;
    variant_id: UUID | null;
    quantity: number;
    unit_price: Money;
    line_total: Money;
  }>;
}

/** Response data — POST /orders (api.md §10, "201") */
export interface CreateOrderResponseData {
  id: UUID;
  order_number: string;
  status: OrderStatus;
  subtotal: Money;
  discount_amount: Money;
  shipping_cost: Money;
  total: Money;
  order_items: Array<
    Pick<
      OrderItem,
      | "id"
      | "product_id"
      | "variant_id"
      | "product_name_snapshot"
      | "variant_name_snapshot"
      | "price_snapshot"
      | "quantity"
      | "subtotal"
    >
  >;
  payment: {
    midtrans_redirect_url: string;
    status: PaymentStatus;
  };
  created_at: ISODateString;
}

/** Body webhook dari Midtrans — POST /payments/midtrans/webhook (api.md §11).
 * Field ini datang dari Midtrans, BUKAN dari FE kita, jadi snake_case-nya
 * mengikuti dokumentasi Midtrans, bukan konvensi internal RoboEdu. */
export interface MidtransWebhookBody {
  order_id: string; // ini order_number, bukan UUID `order.id`
  transaction_id: string;
  transaction_status: string; // mis. "settlement", "pending", "expire"
  fraud_status: string;
  payment_type: string;
  gross_amount: string; // Midtrans kirim sebagai string, bukan number
}

/** Body — POST /admin/orders/{id}/shipment (admin input data pengiriman) */
export interface CreateShipmentRequestBody {
  shipping_provider_id: UUID;
  service?: string;
  tracking_number?: string;
}

/** Body — POST /admin/shipments/{id}/trackings */
export type AddShipmentTrackingRequestBody = Pick<
  ShipmentTracking,
  "status" | "description" | "location" | "occurred_at"
>;

/** Body — PATCH /admin/orders/{id}/status */
export interface UpdateOrderStatusRequestBody {
  status: Extract<
    OrderStatus,
    "PROCESSING" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "REFUNDED"
  >;
}
