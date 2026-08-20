![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)
![Database](https://img.shields.io/badge/MySQL-Drizzle%20ORM-blue)

# RoboEdu

Website e-commerce untuk penjualan **kit robotika edukasi dan sparepart robot**, ditujukan untuk pembeli individual maupun institusi (sekolah, lembaga pendidikan, komunitas, organisasi) di Indonesia. RoboEdu adalah toko tunggal (*single-store*) — seluruh produk yang dijual berasal dari RoboEdu sendiri.

Sebagian besar produk bersifat *made-by-order*, sehingga sistem stok pada platform ini berfungsi sebagai kuota/kapasitas produksi, bukan stok gudang tradisional. Platform mendukung tiga jenis pengguna: **Customer**, **Reseller** (customer dengan status khusus yang disetujui admin, mendapat harga khusus), dan **Admin**.

> 📄 Dokumen acuan lengkap ada di `RoboEdu_PRD.md` (Product Requirement Document) dan `api.md` (API Specification).

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Menjalankan Project](#menjalankan-project)
- [Struktur Folder](#struktur-folder)
- [Penggunaan / Contoh API](#penggunaan--contoh-api)
- [Status Pengembangan](#status-pengembangan)
- [Panduan Kontribusi](#panduan-kontribusi)
- [Lisensi](#lisensi)

---

## Fitur Utama

**Customer**
- Register/login dengan sesi aman
- Katalog produk dengan search, filter, dan sorting
- Cart & wishlist
- Checkout dengan pemilihan alamat, ekspedisi, dan voucher
- Pembayaran online via Midtrans
- Tracking status pesanan
- Review produk (untuk produk yang sudah dibeli)
- Klaim garansi dengan lampiran foto/video

**Reseller**
- Pengajuan status reseller (perlu persetujuan admin)
- Harga khusus reseller setelah status `APPROVED`

**Admin**
- Dashboard (revenue, pesanan, stok menipis, dll.)
- Kelola produk, kategori, product type, variant, dan gambar
- Kelola inventory/stok (kuota produksi)
- Kelola pesanan dan status fulfillment
- Kelola customer & reseller (approval)
- Kelola voucher/promosi
- Moderasi review
- Tindak lanjut klaim garansi
- Laporan penjualan

Detail lengkap kebutuhan fungsional & non-fungsional ada di `RoboEdu_PRD.md` bab 7, 8, 22, dan 23.

---

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js (API routes) + Drizzle ORM |
| Database | MySQL |
| Object Storage | MinIO (self-hosted, S3-compatible) |
| Queue & Cache | Redis + BullMQ |
| Payment Gateway | Midtrans |
| Email Service | Resend (fallback: SendGrid) |
| Infrastruktur | Docker + Docker Compose, VPS, nginx (reverse proxy), Let's Encrypt (SSL) |
| Ekspedisi Awal | J&T (dengan desain shipping provider abstraction) |
| Monitoring | Sentry (error tracking), UptimeRobot (uptime) |
| Logging | Pino (structured JSON logging) |

---

## Prasyarat

Pastikan perangkat berikut sudah terpasang sebelum menjalankan project secara lokal:

- [Node.js](https://nodejs.org/) v18 atau lebih baru
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)
- Package manager: `npm`, `pnpm`, atau `yarn` (sesuaikan dengan yang dipakai tim)
- Akun sandbox [Midtrans](https://dashboard.sandbox.midtrans.com/) untuk testing pembayaran
- Akun [Resend](https://resend.com/) (atau SendGrid) untuk testing pengiriman email

---

## Instalasi

```bash
# 1. Clone repository
git clone <url-repository-roboedu>
cd roboedu

# 2. Install dependencies
npm install

# 3. Salin file environment contoh, lalu isi sesuai kredensial lokal
cp .env.example .env

# 4. Jalankan infrastruktur pendukung (MySQL, Redis, MinIO, nginx) via Docker Compose
docker compose up -d

# 5. Jalankan migration database menggunakan Drizzle ORM
npm run db:migrate

# 6. (Opsional) Seed data dummy — admin user, kategori, contoh produk
npm run db:seed
```

> Urutan setup di atas mengikuti checklist di `RoboEdu_PRD.md` bab 27 (Tahap 0–4): repository & environment → infrastruktur Docker → database foundation → autentikasi → integrasi eksternal, sebelum development frontend dimulai (Tahap 5).

---

## Konfigurasi Environment

Variabel environment disimpan di `.env` (development) dan **tidak pernah** di-commit ke Git. Gunakan `.env.example` sebagai template. Contoh variabel yang dibutuhkan:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/roboedu

# Auth
JWT_SECRET=

# MinIO
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=

# Redis / BullMQ
REDIS_URL=redis://localhost:6379

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Kredensial MinIO bersifat self-defined (bukan diperoleh dari pihak ketiga) saat dijalankan secara self-hosted.

---

## Menjalankan Project

```bash
# Menjalankan Next.js app (development)
npm run dev

# Menjalankan worker BullMQ (background job, container/proses terpisah)
npm run worker

# Build untuk production
npm run build
npm run start
```

Aplikasi berjalan di `http://localhost:3000` secara default. Seluruh service (app, mysql, redis, minio, nginx) juga dapat dijalankan penuh melalui `docker compose up -d` sesuai definisi di `docker-compose.yml`.

---

## Struktur Folder

Proyek menggunakan pendekatan monorepo-style dengan Next.js App Router route groups:

```
roboedu/
├── app/
│   ├── (user)/           # Route user: /, /products, /cart, /checkout, dst.
│   └── (admin)/          # Route admin: /admin, /admin/products, dst.
├── lib/
│   ├── db/
│   │   └── schema/       # Schema Drizzle ORM, dimodulkan per domain
│   └── ...
├── worker/                # Proses/container terpisah untuk BullMQ background job
├── types/                 # Tipe TypeScript hasil generate dari schema & API contract
├── docker/
├── nginx/
├── 0000_roboedu_initial_schema.sql
├── api.md                 # API Specification
├── RoboEdu_PRD.md          # Product Requirement Document
├── .env.example
└── docker-compose.yml
```

---

## Penggunaan / Contoh API

Base URL: `https://api.roboedu.id/api/v1` (mengikuti `api.md`).

**Contoh — Login**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "budi@example.com",
  "password": "Secr3t!2026"
}
```

Response `200 OK`:

```json
{
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "expires_in": 3600,
    "user": { "id": "...", "name": "Budi Santoso", "role": "CUSTOMER", "reseller_status": "NOT_RESELLER" }
  }
}
```

**Contoh — Menambah item ke cart**

```http
POST /api/v1/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": "b7e6c1f0-...",
  "variant_id": "c9a1e2b3-...",
  "quantity": 2
}
```

Seluruh endpoint (autentikasi, produk, cart, checkout, pembayaran, pengiriman, review, klaim garansi, reseller, admin) didokumentasikan lengkap di `api.md`, termasuk format request/response, kode error, dan aturan header (mis. `Idempotency-Key` wajib pada `POST /orders` dan `POST /payments/*`).

---

## Status Pengembangan

Project saat ini berada pada fase **pre-frontend architecture & implementation prep**. Beberapa catatan penting:

- Database schema (`0000_roboedu_initial_schema.sql`) sudah final di Drizzle ORM/MySQL.
- API specification (`api.md`) sudah mencakup 18 bagian, diselaraskan dengan schema kodebase.
- **3 diskrepansi antara kodebase dan PRD masih perlu diputuskan** sebelum tim frontend sepenuhnya mengonsumsi API (lihat `api.md` §18):
  1. Model shipment (`shipment`/`shipment_tracking` terpisah vs. kolom langsung di `order`)
  2. Penamaan status klaim garansi (`OPEN` di kodebase vs. `SUBMITTED/IN_REVIEW/RESOLVED/REJECTED` di PRD)
  3. Granularitas role admin (`CUSTOMER`/`ADMIN` di kodebase vs. `superadmin/admin_sales/admin_laporan` di PRD)
- Tim frontend saat ini membangun UI dengan mock data (melalui fungsi abstraksi seperti `getProducts()`) sebelum backend sepenuhnya terhubung.

---

## Panduan Kontribusi

1. Buat branch baru dari `main`/`develop` dengan format `feature/nama-fitur` atau `fix/nama-bug`.
2. Ikuti konvensi API pada `rest-api-standards-v2.md` untuk perubahan apa pun yang menyentuh endpoint (URL kebab-case, field `snake_case`, UUID v4 untuk ID publik, dll.).
3. Jalankan `npm run lint` dan pastikan tidak ada error sebelum membuat Pull Request.
4. Tulis pesan commit yang jelas, contoh: `feat: add cart item validation`, `fix: correct shipment status enum`.
5. Setiap perubahan pada schema database wajib disertai migration Drizzle ORM yang di-generate, direview, dan dicatat di version control — bukan dijalankan otomatis di background.
6. Jika perubahan memengaruhi struktur data (mis. menghapus/menambah tabel), pastikan perubahan tersebut disebarkan ke seluruh dokumen terkait (schema, ERD, PRD, `api.md`).
7. Ajukan Pull Request dengan deskripsi singkat perubahan dan tag reviewer terkait.

---

## Lisensi

Proyek ini bersifat **proprietary/internal** untuk kebutuhan pengembangan RoboEdu. Belum ditentukan lisensi open-source publik. Hubungi pemilik project untuk izin penggunaan di luar konteks pengembangan ini.