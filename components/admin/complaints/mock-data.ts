import type { AdminComplaintRow, AdminComplaintDetail } from "./complaint-list-types";
import type { ComplaintStatus } from "@/types/enums";
import { deriveMediaType } from "./complaint-attachment-gallery";

/**
 * mock-data.ts
 * ------------------------------------------------------------------
 * Data mock sementara untuk halaman complaints admin.
 * Akan diganti dengan hasil API hook saat backend siap.
 * ------------------------------------------------------------------
 */

export const MOCK_ADMIN_COMPLAINTS: AdminComplaintRow[] = [
  {
    id: "cmp-001",
    subject: "Servo motor tidak berfungsi setelah 2 minggu pemakaian",
    customer_name: "Alex Student",
    customer_email: "alex@example.com",
    customer_phone: "+62 812-9876-5432",
    product_name: "Advanced Servo Motor Controller Board V2",
    order_number: "ORD-112-9876543-1234567",
    status: "OPEN" as ComplaintStatus,
    created_at: "2026-09-15T10:15:00Z",
    updated_at: "2026-09-15T10:15:00Z",
  },
  {
    id: "cmp-002",
    subject: "Sensor HC-SR04 tidak terdeteksi oleh Arduino",
    customer_name: "Budi Santoso",
    customer_email: "budi.s@gmail.com",
    customer_phone: "+62 821-1234-5678",
    product_name: "Ultrasonic Distance Sensor HC-SR04 (Pack of 5)",
    order_number: "ORD-112-1234567-9876543",
    status: "IN_REVIEW" as ComplaintStatus,
    created_at: "2026-09-10T14:20:00Z",
    updated_at: "2026-09-12T09:30:00Z",
  },
  {
    id: "cmp-003",
    subject: "Produk datang dalam kondisi rusak — kotak penyok",
    customer_name: "Citra Dewi",
    customer_email: "citra.dewi@yahoo.com",
    customer_phone: null,
    product_name: "RoboKit Smart Obstacle Avoidance Car",
    order_number: "ORD-20231102-0045",
    status: "RESOLVED" as ComplaintStatus,
    created_at: "2026-08-28T08:30:00Z",
    updated_at: "2026-09-01T11:00:00Z",
  },
  {
    id: "cmp-004",
    subject: "Unit tidak sesuai spesifikasi yang dijanjikan",
    customer_name: "Dimas Anggara",
    customer_email: "dimas.ang@outlook.com",
    customer_phone: "+62 857-9999-0000",
    product_name: "ESP32 IoT Starter Experiment Board",
    order_number: "ORD-20231105-0089",
    status: "REJECTED" as ComplaintStatus,
    created_at: "2026-08-20T13:45:00Z",
    updated_at: "2026-08-25T15:30:00Z",
  },
  {
    id: "cmp-005",
    subject: "Kabel dupont patah saat pertama kali dipasang",
    customer_name: "Eka Pratama",
    customer_email: "eka.pratama@gmail.com",
    customer_phone: "+62 811-5555-6666",
    product_name: "Jumper Wire Dupont Cables Set (120 pcs)",
    order_number: "ORD-20231106-0112",
    status: "OPEN" as ComplaintStatus,
    created_at: "2026-09-17T09:00:00Z",
    updated_at: "2026-09-17T09:00:00Z",
  },
];

export function getMockComplaintDetail(id: string): AdminComplaintDetail {
  const base = MOCK_ADMIN_COMPLAINTS.find((c) => c.id === id) ?? MOCK_ADMIN_COMPLAINTS[0];

  const attachmentsRaw = [
    {
      id: "att-001",
      complaint_id: id,
      file_url: "https://placehold.co/800x600/DEECF8/2483D0?text=Foto+Kerusakan+1",
      file_name: "foto-kerusakan-01.jpg",
      file_type: "image/jpeg",
      created_at: base.created_at,
    },
    {
      id: "att-002",
      complaint_id: id,
      file_url: "https://placehold.co/800x600/FFAFA3/7A2E22?text=Foto+Kerusakan+2",
      file_name: "foto-kerusakan-02.jpg",
      file_type: "image/jpeg",
      created_at: base.created_at,
    },
    {
      id: "att-003",
      complaint_id: id,
      file_url: "",
      file_name: "video-demo-kerusakan.mp4",
      file_type: "video/mp4",
      created_at: base.created_at,
    },
  ];

  return {
    ...base,
    description:
      `Halo admin, saya ingin mengajukan klaim garansi untuk produk yang saya beli pada order ${base.order_number}.\n\n` +
      `Kronologi kejadian:\n` +
      `1. Produk saya terima dalam kondisi packaging yang masih tersegel rapi.\n` +
      `2. Saat pertama kali dinyalakan (tanggal pembelian + 3 hari), produk berfungsi normal.\n` +
      `3. Setelah 2 minggu pemakaian normal sesuai manual book, produk mulai menunjukkan gejala tidak normal.\n` +
      `4. Saya sudah mencoba troubleshooting sesuai FAQ di website, namun tidak ada perbaikan.\n` +
      `5. Kondisi saat ini: produk tidak merespons sama sekali meskipun sudah dipastikan kabel dan daya masuk dengan benar.\n\n` +
      `Saya melampirkan foto dan video sebagai bukti kerusakan. Mohon bantuannya, terima kasih.`,
    resolution: base.status === "RESOLVED"
      ? "Sudah dihubungi via WhatsApp tanggal 3 Sep 2026, customer setuju dikirim unit pengganti. Pengiriman unit baru via J&T Express dengan estimasi 2-3 hari kerja."
      : base.status === "REJECTED"
      ? "Klaim ditolak karena kerusakan disebabkan oleh pemakaian yang tidak sesuai petunjuk (kabel terpasang terbalik, terlihat dari foto lampiran)."
      : null,
    resolved_at:
      base.status === "RESOLVED" ? "2026-09-03T14:00:00Z"
      : base.status === "REJECTED" ? "2026-08-25T15:30:00Z"
      : null,
    price_snapshot: 850000,
    attachments: attachmentsRaw.map((a) => ({
      ...a,
      media_type: deriveMediaType(a.file_type),
    })),
  };
}

export function getComplaintStats() {
  return {
    total: MOCK_ADMIN_COMPLAINTS.length,
    open: MOCK_ADMIN_COMPLAINTS.filter((c) => c.status === "OPEN").length,
    in_review: MOCK_ADMIN_COMPLAINTS.filter((c) => c.status === "IN_REVIEW").length,
    resolved: MOCK_ADMIN_COMPLAINTS.filter((c) => c.status === "RESOLVED").length,
  };
}
