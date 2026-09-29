import type {
  AdminResellerRow,
  AdminResellerDetailData,
  ResellerStats,
} from "./reseller-list-types";
import type { OrderStatus } from "@/types/enums";

// ---------------------------------------------------------------------------
// Mock Data — Daftar Pengajuan Reseller
// ---------------------------------------------------------------------------

export const MOCK_ADMIN_RESELLERS: AdminResellerRow[] = [
  {
    id: "usr-r001",
    name: "Budi Santoso",
    email: "budi.s@gmail.com",
    phone: "+62 813-2233-4455",
    role: "customer",
    reseller_status: "PENDING",
    reseller_applied_at: "2026-09-10T08:30:00Z",
    reseller_approved_at: null,
    is_active: true,
    total_orders: 8,
    total_spent: 8920000,
    last_order_at: "2026-09-05T14:20:00Z",
    last_order_status: "COMPLETED" as OrderStatus,
    created_at: "2026-02-15T11:30:00Z",
  },
  {
    id: "usr-r002",
    name: "Citra Dewi",
    email: "citra.dewi@yahoo.com",
    phone: "+62 819-8765-4321",
    role: "customer",
    reseller_status: "APPROVED",
    reseller_applied_at: "2026-07-20T09:00:00Z",
    reseller_approved_at: "2026-07-22T10:00:00Z",
    is_active: true,
    total_orders: 15,
    total_spent: 18500000,
    last_order_at: "2026-09-12T08:30:00Z",
    last_order_status: "SHIPPED" as OrderStatus,
    created_at: "2026-04-18T09:45:00Z",
  },
  {
    id: "usr-r003",
    name: "Dian Permata",
    email: "dian.permata@sekolah.sch.id",
    phone: "+62 821-5566-7788",
    role: "customer",
    reseller_status: "PENDING",
    reseller_applied_at: "2026-09-13T14:00:00Z",
    reseller_approved_at: null,
    is_active: true,
    total_orders: 3,
    total_spent: 2750000,
    last_order_at: "2026-09-01T09:10:00Z",
    last_order_status: "DELIVERED" as OrderStatus,
    created_at: "2026-06-01T07:00:00Z",
  },
  {
    id: "usr-r004",
    name: "Eka Prasetya",
    email: "eka.prasetya@roboedu.co.id",
    phone: "+62 812-0011-2233",
    role: "customer",
    reseller_status: "APPROVED",
    reseller_applied_at: "2026-05-10T10:00:00Z",
    reseller_approved_at: "2026-05-12T09:00:00Z",
    is_active: true,
    total_orders: 22,
    total_spent: 31200000,
    last_order_at: "2026-09-14T11:00:00Z",
    last_order_status: "PROCESSING" as OrderStatus,
    created_at: "2026-01-20T08:00:00Z",
  },
  {
    id: "usr-r005",
    name: "Farhan Hidayat",
    email: "farhan.hidayat@gmail.com",
    phone: "+62 857-6655-4433",
    role: "customer",
    reseller_status: "REJECTED",
    reseller_applied_at: "2026-08-05T13:00:00Z",
    reseller_approved_at: null,
    is_active: true,
    total_orders: 1,
    total_spent: 450000,
    last_order_at: "2026-07-20T10:30:00Z",
    last_order_status: "COMPLETED" as OrderStatus,
    created_at: "2026-07-15T10:00:00Z",
    rejection_reason:
      "Riwayat pembelian terlalu sedikit. Ajukan kembali setelah minimal 5 transaksi.",
  },
  {
    id: "usr-r006",
    name: "Gita Nuraini",
    email: "gita.nuraini@lembagaedukasi.id",
    phone: "+62 878-1122-3344",
    role: "customer",
    reseller_status: "PENDING",
    reseller_applied_at: "2026-09-15T07:30:00Z",
    reseller_approved_at: null,
    is_active: true,
    total_orders: 6,
    total_spent: 7100000,
    last_order_at: "2026-09-10T16:00:00Z",
    last_order_status: "DELIVERED" as OrderStatus,
    created_at: "2026-03-10T09:00:00Z",
  },
  {
    id: "usr-r007",
    name: "Hendra Wijaya",
    email: "hendra.w@komunitas.org",
    phone: "+62 895-9988-7766",
    role: "customer",
    reseller_status: "APPROVED",
    reseller_applied_at: "2026-06-01T08:00:00Z",
    reseller_approved_at: "2026-06-03T09:30:00Z",
    is_active: true,
    total_orders: 18,
    total_spent: 24600000,
    last_order_at: "2026-09-11T14:00:00Z",
    last_order_status: "PAID" as OrderStatus,
    created_at: "2026-01-05T07:30:00Z",
  },
  {
    id: "usr-r008",
    name: "Indah Lestari",
    email: "indah.lestari@sd-nusantara.sch.id",
    phone: "+62 813-4455-6677",
    role: "customer",
    reseller_status: "REJECTED",
    reseller_applied_at: "2026-08-20T11:00:00Z",
    reseller_approved_at: null,
    is_active: false,
    total_orders: 2,
    total_spent: 1200000,
    last_order_at: "2026-08-15T12:00:00Z",
    last_order_status: "CANCELLED" as OrderStatus,
    created_at: "2026-07-30T08:00:00Z",
    rejection_reason: "Akun tidak aktif dan riwayat pesanan tidak memenuhi syarat minimum.",
  },
];

// ---------------------------------------------------------------------------
// Helper: hitung statistik dari master data
// ---------------------------------------------------------------------------

export function getResellerStats(data: AdminResellerRow[]): ResellerStats {
  return {
    total_resellers: data.filter((r) => r.reseller_status === "APPROVED").length,
    pending_requests: data.filter((r) => r.reseller_status === "PENDING").length,
    rejected_requests: data.filter((r) => r.reseller_status === "REJECTED").length,
    total_applicants: data.filter((r) => r.reseller_status !== "NOT_RESELLER").length,
  };
}

// ---------------------------------------------------------------------------
// Helper: ambil satu reseller detail (untuk halaman [id])
// ---------------------------------------------------------------------------

export function getMockResellerDetail(id: string): AdminResellerDetailData | null {
  const base = MOCK_ADMIN_RESELLERS.find((r) => r.id === id);
  if (!base) return null;

  return {
    ...base,
    // TODO: Phase 2 — ambil dari user_address WHERE is_primary = true
    affiliation_name: "Komunitas Robotika Nusantara & SMP Bina Bangsa Jakarta",
    ktp_nik: "3174**********01",
    npwp_number: "84.921.***.*-012",
    primary_address:
      "Laboratorium Robotika & STEM, SMP Bina Bangsa, Jl. Cendrawasih Raya No. 42, Kel. Gandaria Selatan, Kec. Cilandak, Kota Jakarta Selatan, DKI Jakarta 12140",
    recent_orders: [
      {
        id: "ord-001",
        order_number: "ORD-20260905-001",
        created_at: "2026-09-05T14:20:00Z",
        total: 1850000,
        status: "COMPLETED" as OrderStatus,
        item_count: 2,
        first_item_name: "Robo Kit Car",
      },
      {
        id: "ord-002",
        order_number: "ORD-20260820-042",
        created_at: "2026-08-20T09:15:00Z",
        total: 950000,
        status: "COMPLETED" as OrderStatus,
        item_count: 1,
        first_item_name: "Dinamo Motor",
      },
      {
        id: "ord-003",
        order_number: "ORD-20260801-018",
        created_at: "2026-08-01T11:30:00Z",
        total: 3450000,
        status: "COMPLETED" as OrderStatus,
        item_count: 3,
        first_item_name: "Robo Kit Wind Mill",
      },
    ],
  };
}
