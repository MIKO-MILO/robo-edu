# Evaluasi & Koreksi Roadmap `/profile/reseller`

---

## ❌ Masalah di Roadmap Sebelumnya

Setelah membaca arsitektur proyek secara menyeluruh, ada **6 gap** yang tidak best practice:

---

### Gap 1 — Dua sumber mock data yang redundan

**Masalah:** Roadmap menyuruh membuat mock data di **dua tempat** sekaligus:
- Di hook (`use-reseller-status.ts`) — konstanta `MOCK_MEMBER`
- Di mock API route (`app/api/mock/membership/me/route.ts`) — JSON statis yang sama

Ini memecah kepercayaan ("data mana yang dipakai?") dan mempersulit update. Kalau mock data perlu diubah, harus ubah di dua tempat.

**Koreksi:** Pilih **satu sumber saja**. Karena proyek ini sudah punya pola **hook fetch ke mock API route** (lihat `mock-login`), pakai satu mock API route saja. Hook langsung fetch ke sana — tidak ada konstanta mock di hook.

---

### Gap 2 — Nama dan path mock route tidak mengikuti konvensi proyek

**Masalah:** Roadmap mengusulkan `/api/mock/membership/me` (nested folder `mock/`).

**Konvensi yang ada:** `app/api/mock-login/route.ts` → semua mock routes pakai **hyphen**, bukan nested subfolder.

**Koreksi:** Buat di `app/api/mock-membership-me/route.ts`.

---

### Gap 3 — Types tidak mengikuti struktur barrel yang ada

**Masalah:** Roadmap menyuruh buat `types/membership.ts` sebagai file standalone.

**Konvensi yang ada:**
- `types/enums.ts` — semua enum/status values
- `types/reseller.ts` — semua interface terkait reseller
- `types/index.ts` — barrel semua types

**Koreksi:**
- `MembershipStatus` dan `MembershipPurchaseStatus` masuk ke `types/enums.ts`
- Interfaces (`MembershipPurchase`, `MembershipStatusData`) masuk ke `types/membership.ts` (ganti `types/reseller.ts`)
- Update barrel `types/index.ts`

---

### Gap 4 — Service layer tidak disebutkan sama sekali

**Masalah:** Proyek ini punya `lib/api/services/reseller.service.ts` yang sudah ada. Roadmap tidak menyebut harus membuat `membership.service.ts` dan mendaftarkannya ke `lib/api/index.ts`.

**Koreksi:** Walaupun di fase mock, tetap buat service layer-nya sekarang — isinya boleh komentar TODO, tapi strukturnya sudah ada. Ini penting supaya ketika backend nyata tersedia, developer tinggal isi implementasi tanpa ubah hook sama sekali.

---

### Gap 5 — Cleanup di Tahap 7 (terakhir) adalah anti-pattern

**Masalah:** Membiarkan 5 file lama (`reseller-status-pending`, `reseller-status-rejected`, dll.) hidup selama development membuat teammate bisa **salah import** komponen lama.

**Koreksi:** Cleanup dilakukan **pertama kali** sebelum file baru dibuat (Tahap 1). Buat branch baru, langsung hapus file lama, update barrel dan semua import yang rusak. Ini mencegah konflik dan ambiguitas.

---

### Gap 6 — `enums.ts` belum di-update, padahal `ResellerStatus` lama masih dipakai hook

**Masalah:** Hook lama import `ResellerStatus` dari `types/enums.ts`. Kalau file enum tidak di-update, TypeScript akan error ketika hook ditulis ulang.

**Koreksi:** Update `types/enums.ts` di Tahap 1 — ganti `ResellerStatus` dengan `MembershipStatus` (dengan catatan apakah ada file lain yang masih import `ResellerStatus`).

---

## ✅ Roadmap yang Dikoreksi

### Tahap 0 — Branching (sebelum coding apapun)

```bash
git checkout -b frontend-profile-membership
```

Seluruh pekerjaan di branch ini. Tidak ada commit langsung ke `main`/`dev`.

---

### Tahap 1 — Cleanup File Lama ← **lakukan pertama**

Hapus file lama sebelum tulis yang baru:

```
HAPUS:
components/user/profile/reseller/reseller-application-detail.tsx
components/user/profile/reseller/reseller-status-approved.tsx
components/user/profile/reseller/reseller-status-pending.tsx
components/user/profile/reseller/reseller-status-rejected.tsx
components/user/profile/reseller/reseller-status-not-reseller.tsx
reseller-status-badge.tsx  → akan diganti membership-status-badge.tsx

HAPUS:
lib/api/services/reseller.service.ts      → akan diganti membership.service.ts
lib/api/endpoints/...reseller (jika ada)
```

Update barrel:
- `components/user/profile/reseller/index.ts` → kosongkan dulu
- `lib/api/index.ts` → hapus `export * from "./services/reseller.service"`
- `types/index.ts` → hapus export `reseller.ts`, siapkan untuk `membership.ts`

> **Setelah tahap ini TypeScript akan error** — wajar, karena dependents (page.tsx, hook, dll.) belum diupdate. Selesaikan di tahap berikutnya.

---

### Tahap 2 — Types

**`types/enums.ts`** — update:
```ts
// HAPUS:
// export type ResellerStatus = "NOT_RESELLER" | "PENDING" | "APPROVED" | "REJECTED";

// TAMBAH:
/** Kolom user.membership_status. PRD Bab 6.3. */
export type MembershipStatus = "NOT_MEMBER" | "MEMBER";

/** Kolom membership_purchase.status. PRD Bab 25.1. */
export type MembershipPurchaseStatus =
  | "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
```

> Cek dulu apakah `ResellerStatus` dipakai di file lain selain hook. Kalau masih ada, buat type alias sementara sebelum dihapus total.

**`types/membership.ts`** — buat baru (gantikan `types/reseller.ts`):
```ts
import type { MembershipStatus, MembershipPurchaseStatus } from "./enums";

export interface MembershipPurchase {
  id: string;
  purchase_number: string;
  plan_name_snapshot: string;
  price_snapshot: number;
  duration_months_snapshot: number;
  status: MembershipPurchaseStatus;
  starts_at: string | null;         // ISO 8601; null jika belum PAID
  ends_at: string | null;
  paid_at: string | null;
  payment_method: string | null;    // dari JOIN ke tabel payment
  created_at: string;
}

export interface MembershipStatusData {
  membership_status: MembershipStatus;
  membership_expires_at: string | null;
  purchases: MembershipPurchase[];
}
```

**`types/index.ts`** — update barrel, ganti `reseller` → `membership`.

---

### Tahap 3 — Service Layer (Skeleton)

**Buat `lib/api/services/membership.service.ts`:**
```ts
import { http } from "../base-client";
import type { ApiResponse, MembershipStatusData } from "@/types";

/**
 * membership.service.ts
 * ------------------------------------------------------------------
 * API client untuk endpoint membership customer.
 *
 * Endpoint:
 *   GET /membership/me → getMembershipStatus()
 *
 * TODO(backend): Implementasikan saat endpoint tersedia.
 * Saat ini hook menggunakan mock API route (/api/mock-membership-me).
 * Ketika backend siap:
 *   1. Uncomment implementasi di bawah.
 *   2. Update hook untuk menggunakan service ini.
 *   3. Hapus app/api/mock-membership-me/route.ts.
 * ------------------------------------------------------------------
 */
export const membershipService = {
  /**
   * GET /membership/me
   * Ambil status membership + riwayat pembelian milik user yang login.
   */
  async getMembershipStatus(): Promise<ApiResponse<MembershipStatusData>> {
    return http.get<ApiResponse<MembershipStatusData>>("/membership/me");
  },
};
```

**Update `lib/api/index.ts`:**
```ts
// Hapus: export * from "./services/reseller.service";
// Tambah:
export * from "./services/membership.service";
```

---

### Tahap 4 — Mock API Route

Ikuti konvensi naming proyek (`mock-login`, bukan `mock/login`):

**Buat `app/api/mock-membership-me/route.ts`:**

```ts
import { NextResponse } from "next/server";
import type { MembershipStatusData } from "@/types";

// TODO(backend): Hapus file ini ketika GET /membership/me tersedia di backend.
// Ganti URL di hook dari "/api/mock-membership-me" → "/membership/me"

// Ubah nilai ini untuk test tampilan berbeda:
const MOCK_STATUS: "NOT_MEMBER" | "MEMBER" = "MEMBER";

export async function GET(): Promise<NextResponse<MembershipStatusData>> {
  if (MOCK_STATUS === "NOT_MEMBER") {
    return NextResponse.json({
      membership_status: "NOT_MEMBER",
      membership_expires_at: null,
      purchases: [],
    });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return NextResponse.json({
    membership_status: "MEMBER",
    membership_expires_at: expiresAt.toISOString(),
    purchases: [
      {
        id: "mp-001",
        purchase_number: "MBR-20261026-001",
        plan_name_snapshot: "Plus",
        price_snapshot: 99000,
        duration_months_snapshot: 1,
        status: "PAID",
        starts_at: "2026-10-26T09:00:00Z",
        ends_at: expiresAt.toISOString(),
        paid_at: "2026-10-26T09:05:00Z",
        payment_method: "gopay",
        created_at: "2026-10-26T08:55:00Z",
      },
      {
        id: "mp-002",
        purchase_number: "MBR-20260925-001",
        plan_name_snapshot: "Plus",
        price_snapshot: 99000,
        duration_months_snapshot: 1,
        status: "FAILED",
        starts_at: null,
        ends_at: null,
        paid_at: null,
        payment_method: null,
        created_at: "2026-09-25T14:30:00Z",
      },
      {
        id: "mp-003",
        purchase_number: "MBR-20260826-001",
        plan_name_snapshot: "Plus",
        price_snapshot: 89000,
        duration_months_snapshot: 1,
        status: "EXPIRED",
        starts_at: "2026-08-26T00:00:00Z",
        ends_at: "2026-09-26T00:00:00Z",
        paid_at: "2026-08-26T10:00:00Z",
        payment_method: "bank_transfer",
        created_at: "2026-08-26T09:50:00Z",
      },
    ],
  });
}
```

---

### Tahap 5 — Hook (Tulis Ulang)

**`hooks/user/reseller/use-reseller-status.ts`** — tulis ulang:

```ts
/**
 * useMembershipStatus
 * -------------------
 * FASE MOCK: fetch ke /api/mock-membership-me
 *
 * TRANSISI KE BACKEND:
 *   1. Ganti fetch URL ke "/membership/me" (atau gunakan membershipService)
 *   2. Hapus app/api/mock-membership-me/route.ts
 *   3. Tidak ada perubahan di komponen/page
 *
 * PRD Bab 6.8 | FR-023 | US-011, US-012
 */
"use client";

import { useState, useEffect } from "react";
import type { MembershipStatusData } from "@/types";

export interface UseMembershipStatusReturn {
  data: MembershipStatusData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMembershipStatus(): UseMembershipStatusReturn {
  const [data, setData] = useState<MembershipStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mock-membership-me");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return { data, isLoading, error, refetch: load };
}
```

**Update `hooks/user/reseller/index.ts`:**
```ts
export { useMembershipStatus } from "./use-reseller-status";
export type { UseMembershipStatusReturn } from "./use-reseller-status";
```

---

### Tahap 6 — Komponen UI

**Struktur file final:**
```
components/user/profile/reseller/
├── index.ts                              ← barrel
├── membership-status-badge.tsx           ← MEMBER (hijau) / NOT_MEMBER (abu)
├── membership-not-member.tsx             ← full view NOT_MEMBER
├── membership-info-card.tsx              ← badge + dates + sisa hari + benefit + CTA
├── membership-purchase-status-badge.tsx  ← PENDING/PAID/FAILED/EXPIRED/REFUNDED
├── membership-purchase-table.tsx         ← tabel 7 kolom + pagination
└── membership-member-active.tsx          ← orchestrator view MEMBER
```

**Konten `NOT_MEMBER`:**
- Ilustrasi/ikon membership
- Heading: "Anda belum memiliki Membership Plus"
- Deskripsi singkat: "Bergabunglah sebagai member dan nikmati harga khusus serta akses dropship."
- 2 benefit card:
  - **Harga Member** — Harga lebih hemat di semua produk
  - **Dropship** — Kirim langsung ke pembeli akhir atas nama kamu
- Satu CTA: tombol **"Beli Membership Plus"** → `/reseller`

**Konten `MEMBER` (Info Card):**
- Badge hijau **"Member Aktif"** + label "Paket Plus"
- Tanggal mulai (`starts_at` dari purchase PAID terbaru)
- Tanggal berakhir (`membership_expires_at`)
- Sisa hari — `differenceInDays(expires_at, now)`; highlight ⚠️ bila < 7 hari
- Benefit aktif: `✓ Harga Member` · `✓ Dropship`
- CTA: **"Perpanjang Membership"** → `/reseller` · **"Lihat Produk"** → `/product`

**Konten `MEMBER` (Tabel Purchase History):**

| Kolom | Sumber | Format |
|---|---|---|
| Tanggal Pembelian | `created_at` | `26 Okt 2026` |
| Nomor Pembelian | `purchase_number` | Monospace · `MBR-20261026-001` |
| Paket | `plan_name_snapshot` | `Plus` |
| Periode Berlaku | `starts_at – ends_at` | `26 Okt – 26 Nov 2026` · `—` jika null |
| Nominal | `price_snapshot` | `Rp99.000` |
| Metode Pembayaran | `payment_method` | `GoPay` / `Transfer Bank` / `—` |
| Status | `status` | Badge berwarna |

Status badge:
| Value | Warna | Label |
|---|---|---|
| `PENDING` | 🟡 Kuning | Menunggu Pembayaran |
| `PAID` | 🟢 Hijau | Berhasil |
| `FAILED` | 🔴 Merah | Gagal |
| `EXPIRED` | ⚫ Abu | Kedaluwarsa |
| `REFUNDED` | 🔵 Biru | Dikembalikan |

---

### Tahap 7 — Tulis Ulang `page.tsx`

```tsx
// Switch jadi 2 case saja:
switch (data.membership_status) {
  case "NOT_MEMBER": return <MembershipNotMember />;
  case "MEMBER":     return <MembershipMemberActive data={data} />;
}
```

---

### Tahap 8 — Sidebar Label

`components/user/profile/sidebar.tsx` — ubah label menjadi **"Program Membership"**.

---

## Urutan Kerja yang Benar

```
Tahap 0  Git branch baru
  ↓
Tahap 1  Cleanup file lama (TS akan error sementara — normal)
  ↓
Tahap 2  Tambah types — error TS mulai berkurang
  ↓
Tahap 3  Service skeleton — lib/api/index.ts kembali valid
  ↓
Tahap 4  Mock API route — satu sumber mock data
  ↓
Tahap 5  Hook baru — error di page.tsx tersisa
  ↓
Tahap 6  Komponen UI — error di page.tsx mulai bisa diselesaikan
  ↓
Tahap 7  Page.tsx ditulis ulang — semua TS error hilang
  ↓
Tahap 8  Sidebar update
  ↓
Commit + PR
```

---

## Checklist Acceptance

**Fungsional:**
- [ ] `NOT_MEMBER`: ajakan + 2 benefit + CTA "Beli Membership Plus" → `/reseller`
- [ ] `MEMBER`: badge hijau + paket Plus + tanggal mulai/berakhir + sisa hari
- [ ] Sisa hari < 7: highlight warna peringatan
- [ ] `MEMBER`: benefit `✓ Harga Member` · `✓ Dropship`
- [ ] `MEMBER`: CTA "Perpanjang Membership" → `/reseller`
- [ ] `MEMBER`: CTA "Lihat Produk" → `/product`
- [ ] Tabel purchase history: 7 kolom, diurutkan terbaru, pagination
- [ ] Status badge tabel: 5 warna berbeda
- [ ] Baris PENDING/FAILED: kolom periode berlaku = "—"
- [ ] Skeleton loading saat fetch
- [ ] Error state + tombol "Coba Lagi"
- [ ] Sidebar label = "Program Membership"

**Arsitektur:**
- [ ] Tidak ada mock data di dua tempat sekaligus
- [ ] Mock route mengikuti naming convention proyek (`mock-membership-me`)
- [ ] Types masuk ke barrel `types/index.ts`
- [ ] Enums baru masuk ke `types/enums.ts`
- [ ] Service layer (`membership.service.ts`) terdaftar di `lib/api/index.ts`
- [ ] File lama sudah dihapus sebelum file baru dibuat
- [ ] Tidak ada `import` ke file reseller lama yang tersisa

---

> [!NOTE]
> **Transisi ke backend nanti:** Ganti URL hook dari `/api/mock-membership-me` → gunakan `membershipService.getMembershipStatus()`. Hapus `app/api/mock-membership-me/route.ts`. Tidak ada yang berubah di komponen atau page.
