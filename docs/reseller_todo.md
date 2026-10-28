# 📋 To-Do List: Fitur Reseller — RoboEdu

> Berdasarkan analisis [PRD-FINAL.md](file:///d:/goldipekael/robo-edu/docs/PRD-FINAL.md) (Bab 6, 21, 22, 25, 28) vs codebase saat ini.

---

## Status Saat Ini

| Aspek | Status |
|---|---|
| Admin `/admin/resellers` (list) | ✅ Ada (UI + mock data) |
| Admin `/admin/resellers/[id]` (detail) | ✅ Ada (UI + mock data) |
| Admin komponen (table, filter, stepper, approve/reject) | ✅ Ada |
| `reseller.service.ts` (API client) | ✅ Ada (tapi endpoint belum ada) |
| Types & enums (`ResellerStatus`) | ✅ Ada |
| Customer `/reseller` (info page) | ❌ Belum ada |
| Customer `/reseller/apply` (form) | ❌ Belum ada |
| Customer `/profile/reseller` (status) | ❌ Belum ada |
| Tabel DB `reseller_application` | ❌ Belum ada (schema & migration) |
| API endpoints backend (real) | ❌ Belum ada |
| Navigasi/link reseller (navbar, footer, profil) | ❌ Belum ada |
| Email notifikasi reseller | ❌ Belum ada |
| Harga reseller di produk/cart/checkout | ❌ Belum ada |

---

## Prioritas 1 — WAJIB / Fondasi (Kerjakan Pertama)

> [!IMPORTANT]
> Item ini adalah fondasi yang harus ada sebelum fitur reseller bisa berfungsi end-to-end. Tanpa ini, semua yang lain tidak bisa jalan.

### 1.1 🗄️ Database: Tabel `reseller_application`
**Ref**: PRD-FINAL Bab 25.1

Buat Drizzle schema & migration untuk tabel `reseller_application`:

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | PK | |
| `user_id` | FK → user | |
| `applicant_type` | ENUM | INDIVIDUAL, BUSINESS, INSTITUTION |
| `business_name` | VARCHAR | Nama usaha / institusi |
| `whatsapp_number` | VARCHAR | |
| `business_address` | VARCHAR | |
| `province / city / district` | VARCHAR | |
| `sales_channels` | JSON | Array kanal penjualan |
| `store_url` | VARCHAR, NULLABLE | |
| `estimated_monthly_volume` | VARCHAR | Rentang pilihan |
| `reason` | TEXT | Alasan / rencana penjualan |
| `document_url` | VARCHAR, NULLABLE | Disimpan di MinIO |
| `status` | ENUM | PENDING, APPROVED, REJECTED |
| `rejection_reason` | TEXT, NULLABLE | Wajib diisi bila REJECTED |
| `reviewed_by` | FK → user, NULLABLE | Admin yang review |
| `reviewed_at` | TIMESTAMP, NULLABLE | |
| `created_at / updated_at` | TIMESTAMP | |

> [!WARNING]
> Struktur field ini **berbeda** dengan mock data admin yang sekarang (yang pakai `ktp_nik`, `npwp_number`, `affiliation_name`). Perlu disesuaikan nanti di Prioritas 2.3.

---

### 1.2 🌐 API Endpoint: Pengajuan Reseller (Customer)
**Ref**: PRD-FINAL Bab 6.5, FR-022

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/reseller/apply` | Submit form pengajuan reseller |
| `GET` | `/api/reseller/status` | Cek status pengajuan sendiri |
| `GET` | `/api/reseller/application` | Ambil data pengajuan lengkap (untuk prefill re-apply) |

Aturan:
- Validasi server-side semua field (sumber kebenaran)
- Header `Idempotency-Key` untuk cegah duplikasi
- Satu user hanya boleh punya 1 pengajuan PENDING
- User `is_active = false` → `403 FORBIDDEN`
- User sudah PENDING/APPROVED → redirect ke `/profile/reseller`
- Upload dokumen (NPWP/legalitas) ke MinIO, simpan URL di `document_url`

---

### 1.3 🌐 API Endpoint: Review Reseller (Admin)
**Ref**: PRD-FINAL Bab 6.7, FR-023

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/admin/reseller-applications` | List pengajuan (filter by status) |
| `GET` | `/api/admin/reseller-applications/[id]` | Detail pengajuan + riwayat order pemohon |
| `PATCH` | `/api/admin/reseller-applications/[id]/approve` | Setujui pengajuan |
| `PATCH` | `/api/admin/reseller-applications/[id]/reject` | Tolak pengajuan (alasan wajib) |

Aturan:
- Update `user.reseller_status` & `user.reseller_approved_at`
- Catat ke `audit_log` (FR-017)
- Trigger email notification via BullMQ

---

## Prioritas 2 — Halaman Customer (Kerjakan Setelah Fondasi)

> [!NOTE]
> Ini adalah halaman yang langsung diakses user. Semua sudah didefinisikan di PRD-FINAL Bab 6.4–6.6 dengan detail lengkap.

### 2.1 📄 Halaman `/reseller` — Info Program Reseller
**Ref**: PRD-FINAL Bab 6.4

Halaman publik (tidak perlu login) berisi:
- Manfaat harga khusus reseller
- Syarat menjadi reseller
- Alur 3 langkah (Daftar → Review → Aktif)
- FAQ singkat tentang program
- Tombol CTA **"Ajukan Jadi Reseller"** → menuju `/reseller/apply`
- Jika belum login, arahkan ke `/login?redirect=/reseller/apply`

---

### 2.2 📝 Halaman `/reseller/apply` — Form Pengajuan
**Ref**: PRD-FINAL Bab 6.5–6.6

Form dikelompokkan dalam **3 seksi**:

**Seksi 1 — Data Pemohon** (prefilled read-only dari akun):
- Nama, email, nomor telepon

**Seksi 2 — Data Usaha**:
- Tipe pemohon (Radio: Individu / Usaha / Institusi) — **wajib**
- Nama usaha/institusi (maks 255 char) — **wajib**
- Nomor WhatsApp aktif (default dari `user.phone`) — **wajib**
- Alamat usaha (dropdown provinsi/kota/kecamatan + textarea) — **wajib**
- Kanal penjualan (multi-select) — **wajib**, min 1
- Link toko/media sosial (URL, validasi format) — opsional
- Perkiraan pembelian/bulan (select rentang) — **wajib**
- Alasan/rencana penjualan (textarea, 20–1000 char) — **wajib**

**Seksi 3 — Dokumen & Persetujuan**:
- Upload NPWP/dokumen legalitas (JPG/PNG/PDF, maks 5 MB) — opsional
- Checkbox persetujuan S&K reseller — **wajib** (tombol kirim disabled sampai dicentang)

**Aturan UX**:
- Error inline di bawah field, auto-scroll ke error pertama saat submit gagal
- Draft disimpan di `localStorage` agar tidak hilang saat sesi habis
- Setelah submit sukses → layar konfirmasi + tombol ke `/profile/reseller`
- Validasi client + server (server = sumber kebenaran)
- Race condition (pengajuan sudah ada) → `409 CONFLICT` → redirect ke `/profile/reseller`

**Aturan akses**:
- Harus login (jika belum → `/login?redirect=/reseller/apply`)
- Status PENDING atau APPROVED → redirect ke `/profile/reseller`
- Status REJECTED → form terisi data lama (re-apply)

---

### 2.3 📊 Halaman `/profile/reseller` — Status Pengajuan
**Ref**: PRD-FINAL Bab 6.6

Tampilan berbeda per status:

| Status | Tampilan | CTA |
|---|---|---|
| `NOT_RESELLER` | Ajakan bergabung + ringkasan manfaat | "Ajukan Jadi Reseller" → `/reseller/apply` |
| `PENDING` | Badge kuning "Menunggu Review", tanggal pengajuan, data yang dikirim (read-only) | Tidak ada (opsional: "Batalkan Pengajuan") |
| `APPROVED` | Badge hijau "Reseller Aktif", tanggal disetujui | "Lihat Produk" |
| `REJECTED` | Badge merah "Pengajuan Ditolak" + alasan dari admin | "Ajukan Ulang" (form terisi data lama) |

---

## Prioritas 3 — Navigasi & Integrasi (Setelah Halaman Jadi)

### 3.1 🧭 Tambah Link Reseller di Navigasi
**Ref**: PRD-FINAL Bab 6.4

- [ ] Tambah **"Program Reseller"** di menu navigasi profil (sejajar dengan My Profile, Orders, Settings)
- [ ] Tambah **"Jadi Reseller"** di footer website
- [ ] (Opsional) CTA banner di halaman produk atau profil

---

### 3.2 🔄 Update Admin Detail Page: Sesuaikan dengan `reseller_application`
**Ref**: PRD-FINAL Bab 6.7, 25.1

> [!WARNING]
> Mock data admin sekarang menggunakan field lama (`ktp_nik`, `npwp_number`, `affiliation_name`) yang **tidak sesuai** dengan ERD final `reseller_application`. Perlu di-refactor.

Yang perlu diubah di [reseller-list-types.ts](file:///d:/goldipekael/robo-edu/components/admin/resellers/reseller-list-types.ts) dan [mock-data.ts](file:///d:/goldipekael/robo-edu/components/admin/resellers/mock-data.ts):
- [ ] Ganti `affiliation_name` → `business_name`
- [ ] Ganti `ktp_nik` → hapus (tidak diminta di PRD-FINAL)
- [ ] Ganti `npwp_number` → `document_url` (file upload)
- [ ] Tambah field: `applicant_type`, `whatsapp_number`, `business_address`, `province`, `city`, `district`, `sales_channels`, `store_url`, `estimated_monthly_volume`, `reason`
- [ ] Update [reseller-info-card.tsx](file:///d:/goldipekael/robo-edu/components/admin/resellers/reseller-info-card.tsx) untuk menampilkan field baru
- [ ] Update mock data sesuai struktur baru

---

### 3.3 💰 Tampilkan Harga Reseller di Frontend
**Ref**: PRD-FINAL Bab 6.3, 6.6

Saat ini **tidak ada** tampilan harga reseller di sisi customer. Perlu ditambahkan:

- [ ] **Detail Produk** (`/product/[slug]`): Tampilkan harga reseller jika user `APPROVED`
- [ ] **Kartu Produk** (katalog): Badge "Harga Reseller" untuk user APPROVED
- [ ] **Cart** (`/cart`): Gunakan harga reseller untuk subtotal
- [ ] **Checkout** (`/checkout`): Gunakan harga reseller, snapshot ke `order_item.price_snapshot`
- [ ] Banner/badge global **"Harga Reseller"** untuk user APPROVED (non-intrusif)

---

## Prioritas 4 — Notifikasi Email (Bisa Paralel)

### 4.1 📧 Email Notifikasi Reseller
**Ref**: PRD-FINAL Bab 6.8, FR-024

| Event | Penerima | Isi |
|---|---|---|
| Pengajuan diterima sistem | Customer | Konfirmasi pengajuan terkirim |
| Pengajuan disetujui | Customer | Penjelasan akses harga reseller |
| Pengajuan ditolak | Customer | Alasan + info cara mengajukan ulang |
| Pengajuan baru masuk | Admin | Badge jumlah PENDING di dashboard/sidebar |

- [ ] Buat email templates untuk 3 event customer
- [ ] Kirim via BullMQ + Resend/SendGrid
- [ ] Catat di `email_log`
- [ ] Badge PENDING count di sidebar admin (sudah ada partial di [sidebar.tsx](file:///d:/goldipekael/robo-edu/components/admin/sidebar.tsx))

---

## Prioritas 5 — Edge Case & Polish

### 5.1 🛡️ Keamanan & Validasi
- [ ] Middleware cek `reseller_status` untuk operasi harga
- [ ] Idempotency-Key header pada form submission
- [ ] Rate limiting pada endpoint pengajuan
- [ ] File upload validation (tipe, ukuran maks 5 MB)
- [ ] Dokumen `document_url` hanya bisa diakses admin (MinIO policy)

### 5.2 🎨 UX Polish
- [ ] `localStorage` draft save saat mengisi form (cegah data hilang)
- [ ] Loading state saat submit
- [ ] Optimistic UI update saat admin approve/reject
- [ ] Banner kecil non-intrusif "Status Reseller: Menunggu Review" di profil (untuk PENDING)

---

## Urutan Pengerjaan yang Disarankan

```
┌─────────────────────────────────────────────────────┐
│ 1. DB Schema (reseller_application) + Migration     │ ← Fondasi
│ 2. API Endpoints Customer (apply, status)           │ ← Fondasi
│ 3. API Endpoints Admin (list, detail, approve/rej.) │ ← Fondasi
├─────────────────────────────────────────────────────┤
│ 4. Halaman /reseller (info publik)                  │ ← Customer
│ 5. Halaman /reseller/apply (form)                   │ ← Customer
│ 6. Halaman /profile/reseller (status)               │ ← Customer
├─────────────────────────────────────────────────────┤
│ 7. Link navigasi (navbar, footer, profil)           │ ← Integrasi
│ 8. Refactor admin detail (field sesuai PRD-FINAL)   │ ← Integrasi
│ 9. Harga reseller di produk/cart/checkout            │ ← Integrasi
├─────────────────────────────────────────────────────┤
│ 10. Email notifikasi reseller                       │ ← Notifikasi
│ 11. Edge case & polish                              │ ← Polish
└─────────────────────────────────────────────────────┘
```

---

> **User Stories terkait**: US-011, US-012, US-013 | **Functional Req**: FR-010, FR-022, FR-023, FR-024
