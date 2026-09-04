![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)
![Database](https://img.shields.io/badge/MySQL-Drizzle%20ORM-blue)

# RoboEdu

Website e-commerce untuk penjualan **kit robotika edukasi dan sparepart robot**, ditujukan untuk pembeli individual maupun institusi (sekolah, lembaga pendidikan, komunitas, organisasi) di Indonesia. RoboEdu adalah toko tunggal (_single-store_) — seluruh produk yang dijual berasal dari RoboEdu sendiri.

Sebagian besar produk bersifat _made-by-order_, sehingga sistem stok pada platform ini berfungsi sebagai kuota/kapasitas produksi, bukan stok gudang tradisional. Platform mendukung tiga jenis pengguna: **Customer**, **Reseller** (customer dengan status khusus yang disetujui admin, mendapat harga khusus), dan **Admin**.

> 📄 Dokumen acuan lengkap ada di `docs/RoboEdu_PRD.md` (Product Requirement Document) dan `docs/api.md` (API Specification).

---

## ⚡ QUICK START — 3 LANGKAH LANGSUNG JALAN

> **Cara termudah untuk memulai untuk SEMUA orang di tim.** Tidak perlu install Node/npm secara terpisah. Semua (app + MySQL + Redis + MinIO + nginx) berjalan di dalam Docker.

| Langkah                 | Windows (PowerShell)                                                                                                | Mac / Linux (Terminal)            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **1. Setup env (auto)** | `.\setup.ps1`                                                                                                       | `chmod +x setup.sh && ./setup.sh` |
| **2. Build + Start**    | `docker compose up -d --build`                                                                                      | `docker compose up -d --build`    |
| **3. Buka browser**     | **http://localhost:3001** ← App<br>**http://localhost:80** ← Via nginx<br>**http://localhost:9003** ← MinIO Console | SAMA                              |

✅ **Done.** Hanya butuh 2–3 menit pertama kali (build image). Untuk start selanjutnya cukup `docker compose up -d` (±10 detik).

> 💡 Setup script akan **otomatis** generate semua credential (DB password, Session Secret, MinIO keys) dan menyimpan ke `.env` (file ini TIDAK di-commit ke git).

---

## ❓ Butuh Install Node di Host? (Alternatif tanpa Docker)

Jika kamu ingin run Next.js di luar Docker (misal untuk debug native dengan VS Code breakpoints tanpa container), lihat bagian [Menjalankan Tanpa Docker](#menjalankan-tanpa-docker) di bawah. **TAPI — untuk onboarding anggota tim BARU, selalu rekomendasikan Quick Start 3 langkah di atas (Docker)**, karena:

- Tidak ada "works on my machine"
- Tidak perlu install MySQL/Redis/MinIO sendiri
- Config default sudah disesuaikan semua service bisa saling terhubung

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [⚡ QUICK START — 3 Langkah Langsung Jalan](#-quick-start--3-langkah-langsung-jalan)
- [Detail: Setup Script](#detail-setup-script-setupps1--setupsh)
- [Detail: Docker Compose Stack](#detail-docker-compose-stack)
- [Konfigurasi Environment (`.env`)](#konfigurasi-environment-env)
  - [Override Port jika Tabrakan](#override-port-jika-tabrakan)
  - [Full List Environment Variable](#full-list-environment-variable)
- [Menjalankan Project](#menjalankan-project)
  - [Menjalankan DENGAN Docker (Rekomendasi Tim)](#menjalankan-dengan-docker-rekomendasi-tim)
  - [Menjalankan Tanpa Docker](#menjalankan-tanpa-docker)
- [Cheat Sheet — Perintah Docker yang Sering Dipakai](#cheat-sheet--perintah-docker-yang-sering-dipakai)
- [Migrasi Database (Drizzle ORM)](#migrasi-database-drizzle-orm)
- [Struktur Folder](#struktur-folder)
- [Penggunaan / Contoh API](#penggunaan--contoh-api)
- [Status Pengembangan](#status-pengembangan)
- [Troubleshooting — FAQ](#troubleshooting--faq)
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

Detail lengkap kebutuhan fungsional & non-fungsional ada di `docs/RoboEdu_PRD.md` bab 7, 8, 22, dan 23.

---

## Tech Stack

| Layer           | Teknologi                                                                |
| --------------- | ------------------------------------------------------------------------ |
| Frontend        | Next.js 16 (App Router) + TypeScript + Tailwind CSS                      |
| Backend         | Next.js (API routes) + Drizzle ORM                                       |
| Database        | MySQL 8.4                                                                |
| Object Storage  | MinIO (self-hosted, S3-compatible)                                       |
| Queue & Cache   | Redis 7 + BullMQ                                                         |
| Payment Gateway | Midtrans                                                                 |
| Email Service   | Resend (fallback: SendGrid)                                              |
| Infrastruktur   | Docker + Docker Compose, VPS, nginx (reverse proxy), Let's Encrypt (SSL) |
| Ekspedisi Awal  | J&T (dengan desain shipping provider abstraction)                        |
| Monitoring      | Sentry (error tracking), UptimeRobot (uptime)                            |
| Logging         | Pino (structured JSON logging)                                           |

---

## Prasyarat

Pastikan perangkat berikut sudah terpasang **SEBELUM** menjalankan project:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) v4.25+ (sudah termasuk Docker Compose). **WAJIB untuk QUICK START.**
  - Windows: Pastikan WSL2 backend aktif (direkomendasikan, build 2x lebih cepat ketimbang Hyper-V biasa)
  - Mac ARM (M1/M2/M3): Docker Desktop untuk Apple Silicon sudah support multi-arch image auto-select
- [Git](https://git-scm.com/)
- (Opsional) [Node.js](https://nodejs.org/) v18+ dan `npm` — **hanya jika** kamu ingin menjalankan Next.js DI LUAR Docker (lihat [Menjalankan Tanpa Docker](#menjalankan-tanpa-docker))
- (Opsional) Akun sandbox [Midtrans](https://dashboard.sandbox.midtrans.com/) untuk testing pembayaran
- (Opsional) Akun [Resend](https://resend.com/) (atau SendGrid) untuk testing pengiriman email

---

## Detail: Setup Script (`setup.ps1` / `setup.sh`)

Kedua script bekerja **identik**, hanya beda bahasa shell (PowerShell vs Bash). Jalankan **SEKALI SAJA** setelah clone repo (jika `.env` sudah ada, script hanya akan mengganti **placeholder** yang belum diubah, jadi aman untuk dijalankan berulang).

**Apa yang dilakukan script:**

1. Copy `.env.example` → `.env` (jika `.env` belum ada)
2. **Auto-generate random secure value** via cryptographic RNG untuk:
   - `DB_PASSWORD` (placeholder `password_ubah_disini`)
   - `DB_ROOT_PASSWORD` (placeholder `rootpassword_ubah_disini`)
   - `MINIO_ACCESS_KEY` (placeholder `minioadmin_ubah_disini`)
   - `MINIO_SECRET_KEY` (placeholder `miniosecret_ubah_disini`)
   - `SESSION_SECRET` (placeholder `ganti_dengan_random_string_panjang_minimal_32_char`)
3. Print ringkasan port dan perintah selanjutnya.

---

## Detail: Docker Compose Stack

`docker compose up` akan menjalankan **5 container** berikut di dalam satu jaringan Docker internal (`robo-edu_default`):

| Service Name | Image / Source                                                                               | Fungsi                                                                     | Status Default | Port di Host (bisa di-override di `.env`)                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **mysql**    | `mysql:8.4`                                                                                  | Database relasional                                                        | Healthy        | `(tidak diexpose default)`<br>→ [Cara buka akses host](#bagaimana-cara-akses-mysql-dari-host-misal-pakai-dbeaver--navicat-) |
| **redis**    | `redis:7-alpine`                                                                             | Cache + BullMQ queue broker                                                | Healthy        | `(tidak diexpose default)`                                                                                                  |
| **minio**    | `minio/minio`                                                                                | Object storage (S3-compatible) untuk gambar produk, lampiran klaim garansi | Healthy        | **API**: `${MINIO_API_PORT:-9002}` → 9000<br>**Console UI**: `${MINIO_CONSOLE_PORT:-9003}` → 9001                           |
| **app**      | build dari `Dockerfile` (stage `runner`)<br>CMD = `npm run dev` (Next.js Turbopack dev mode) | Aplikasi web utama Next.js                                                 | Healthy        | `${APP_PORT:-3001}` → 3000                                                                                                  |
| **nginx**    | `nginx:alpine`<br>config dari `./nginx/default.conf`                                         | Reverse proxy (depan app) + terminasi SSL (jika di-production)             | Started        | `${NGINX_HTTP_PORT:-80}` → 80<br>`${NGINX_HTTPS_PORT:-443}` → 443                                                           |

**Relasi depends_on (health-based):**

```
app     → mysql (healthy), redis (healthy), minio (healthy)
nginx   → app (healthy)
```

Jika app GAGAL health check — nginx TIDAK AKAN start (menghindari nginx nyala tapi app mati → 502 Bad Gateway membingungkan).

---

## Konfigurasi Environment (`.env`)

> **JANGAN commit file `.env` ke git!** Sudah di-ignore oleh `.gitignore`. Gunakan `.env.example` sebagai template, atau jalankan setup script untuk generate otomatis.

### Override Port jika Tabrakan

Jika di device kamu port 80 / 3001 / 9002 sudah dipakai aplikasi lain (IIS, XAMPP, Skype, dll.), **tidak usah edit `docker-compose.yml`**. Cukup tambahkan baris berikut di file `.env`:

```env
# === PORT OVERRIDES (optional, hapus jika tidak butuh) ===
APP_PORT=3002              # default: 3001
NGINX_HTTP_PORT=8080       # default: 80
NGINX_HTTPS_PORT=8443      # default: 443
MINIO_API_PORT=9102        # default: 9002
MINIO_CONSOLE_PORT=9103    # default: 9003

# === SPECIAL OVERRIDES (JARANG DIBUTUHKAN) ===
# Hapus tanda pagar JIKA DAN HANYA JIKA Next.js dev mode dapat error
# "EACCES permission denied" menulis file ke bind mount (biasanya hanya terjadi
# pada Linux native Docker Engine yang strict user namespace):
# APP_USER=0:0
```

### Full List Environment Variable

Variabel environment disimpan di `.env` (development) dan **tidak pernah** di-commit ke Git. Gunakan `.env.example` sebagai template:

```env
# ================================================================
# Database
# ================================================================
# Host "mysql" itu nama service di docker-compose.yml.
# Jika kamu jalankan Next.js di LUAR Docker (bukan dalam container app),
# ganti "mysql" → "127.0.0.1" dan expose port MySQL (lihat FAQ di bawah).
DATABASE_URL=mysql://roboedu:DB_PASSWORD_KAMU@mysql:3306/roboedu

# Credential untuk service mysql container (dibaca oleh entrypoint MySQL, BUKAN app Next.js)
DB_PASSWORD=...
DB_ROOT_PASSWORD=...

# ================================================================
# Redis (Queue + BullMQ + Cache)
# ================================================================
# Host "redis" itu nama service di compose.
REDIS_URL=redis://redis:6379

# ================================================================
# MinIO (Object Storage, S3-compatible)
# ================================================================
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_BUCKET=roboedu-public

# ================================================================
# Midtrans (Payment Gateway)
# ================================================================
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# ================================================================
# Email Service
# ================================================================
# Resend (primary)
RESEND_API_KEY=
# SendGrid (fallback) — opsional, jika mau pakai Resend aja boleh kosong
SENDGRID_API_KEY=
# Alamat email pengirim (harus diverifikasi di Resend / SendGrid)
EMAIL_FROM=no-reply@roboedu.id
EMAIL_FROM_NAME=RoboEdu

# ================================================================
# Auth / Session
# ================================================================
SESSION_SECRET=...   # random string MINIMAL 32 karakter (setup.sh auto-generate 64)

# ================================================================
# App
# ================================================================
NEXT_PUBLIC_APP_URL=http://localhost
NODE_ENV=development
```

---

## Menjalankan Project

### Menjalankan DENGAN Docker (Rekomendasi Tim)

```bash
# Start SELURUH stack (app + mysql + redis + minio + nginx)
# Pertama kali: otomatis build image app.
docker compose up -d --build

# Start selanjutnya (tanpa build ulang) — ~10 detik.
docker compose up -d

# Hentikan seluruh stack (volume data TETAP, DB TIDAK hilang)
docker compose down

# Hentikan + HAPUS SEMUA DATA (volume mysql_data/redis_data/minio_data IKUT TERHAPUS!)
# Hanya gunakan jika mau reset total database.
docker compose down -v

# Cek status semua container
docker compose ps -a
```

**Setelah nyala:**

- App (dev mode, hot reload): **http://localhost:3001** (langsung ke Next.js)
- App (via nginx reverse proxy): **http://localhost:80**
- MinIO Console: **http://localhost:9003** (login pakai `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` dari `.env`)

> 🔥 **Hot Reload:** Folder `app/`, `components/`, `src/`, dll. **di-bind mount** ke container. Edit file di lokal → Next.js otomatis hot reload tanpa restart container.

---

### Menjalankan Tanpa Docker

> **⚠️ Hanya untuk orang yang paham kebutuhan lokal (native debugging, performance profiling).** Anggota tim baru WAJIB pakai Docker path.

Prasyarat tambahan:

- Node.js 22+ & npm ter-install secara global
- MySQL 8.4, Redis 7, dan MinIO **sudah jalan sendiri** (atau kamu start 3 service itu saja via docker, tapi Next.js di host)

```bash
# 1. Install dependency
npm install

# 2. Pastikan .env menunjuk ke localhost
#    DATABASE_URL=...@127.0.0.1:3306/roboedu (bukan @mysql)
#    REDIS_URL=redis://127.0.0.1:6379
#    MINIO_ENDPOINT=127.0.0.1, MINIO_PORT=9002 (sesuaikan port expose compose)

# 3. Jalankan migration database
npm run db:migrate

# 4. Jalankan Next.js dev server
npm run dev
# → Buka http://localhost:3000  (catatan: port default 3000, BUKAN 3001 seperti compose)

# Build untuk production
npm run build
npm run start
```

---

## Cheat Sheet — Perintah Docker yang Sering Dipakai

| Perintah                                     | Apa yang Dilakukannya                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| `docker compose ps -a`                       | Lihat status SEMUA container + port mapping                                      |
| `docker compose logs app --tail=100`         | Lihat 100 baris log terakhir **app** (Next.js dev/start output)                  |
| `docker compose logs --tail=50`              | Lihat log **SEMUA service** sekaligus                                            |
| `docker compose logs app -f`                 | Follow (streaming) log app secara realtime (ctrl+C keluar)                       |
| `docker compose restart app`                 | Restart hanya container app (misal ubah .env di luar env_file, tapi jarang)      |
| `docker compose exec app bash`               | Masuk ke terminal di DALAM container app (untuk debugging)                       |
| `docker compose exec app npm run db:migrate` | Jalankan migration DARI DALAM container app (paling aman, karena env sudah siap) |
| `docker compose build app --no-cache`        | Paksa build ulang image app DARI NOL (tanpa cache — jika hasil build aneh)       |

---

## Migrasi Database (Drizzle ORM)

Semua migration disimpan di folder `./drizzle/`.

```bash
# --- DIJALANKAN DARI DALAM CONTAINER APP (REKOMENDASI) ---
docker compose exec app npm run db:migrate

# --- DIJALANKAN DARI HOST (jika next.js dijalankan native) ---
npm run db:generate    # Generate migration SQL baru dari perubahan schema di src/db/schema
npm run db:migrate     # Apply migration yang pending ke database
npm run db:push        # Langsung push schema ke DB TANPA membuat file migration (hanya untuk dev cepat!)
npm run db:studio      # Buka Drizzle Studio (GUI jelajahi DB) di browser
```

> ⚠️ **Production rule:** Jangan pernah pakai `db:push` ke database production. Selalu generate migration (`db:generate`) + apply (`db:migrate`), dan commit file migration ke git.

---

## Struktur Folder

Proyek menggunakan Next.js App Router dengan route groups:

```
robo-edu/
├── app/                       # Next.js App Router (halaman + route handlers)
│   ├── (auth)/                # Route group: /login, /register
│   ├── (admin)/               # Route group: dashboard admin
│   ├── (user)/                # Route group: homepage, /product, /cart, /profile, /about, /contact
│   ├── layout.tsx
│   ├── globals.css
│   └── favicon.ico
├── components/                # Reusable React components
│   ├── ui/                    # ShadCN UI primitives (button, dialog, input, card, ...)
│   ├── auth/                  # Komponen auth
│   └── user/                  # Komponen khusus halaman user (landing, product, orders, wishlist, ...)
├── contexts/                  # React Context Providers (WishlistContext, dll.)
├── lib/
│   └── utils.ts               # Shared utility (cn: tailwind-merge, dll.)
├── src/
│   └── db/
│       ├── schema/            # Schema Drizzle ORM (per domain: user, product, order, cart, ...)
│       ├── relations/         # Relasi antar tabel Drizzle
│       └── index.ts           # Export drizzle client instance + koneksi
├── types/                     # Tipe TypeScript global untuk entity domain (admin, cart, order, review, ...)
├── drizzle/                   # File migration SQL + meta Drizzle (commit ke git!)
├── public/                    # Static assets (images, svg logo)
├── nginx/
│   └── default.conf           # Config nginx reverse proxy (mount ke container nginx)
├── docs/                      # PRD, API spec, design doc
│   ├── PRD.md
│   ├── api.md
│   ├── rest-api-standards-v2.md
│   └── stitch/                # Design reference UI
├── .env.example               # Template environment (setup script copy dari ini)
├── .env                       # Environment AKTIF (tidak di-commit)
├── .dockerignore              # File di-exclude dari docker build context (speed up build)
├── Dockerfile                 # Multi-stage build: deps → builder → runner
├── docker-compose.yml         # Stack 5 service (mysql/redis/minio/app/nginx)
├── setup.ps1                  # Setup script Windows (PowerShell)
├── setup.sh                   # Setup script Mac/Linux (Bash)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.mjs        # (jika pakai tailwind v3; v4 pakai CSS import directive)
├── eslint.config.mjs
└── drizzle.config.ts          # Config Drizzle Kit (generate, migrate path)
```

---

## Penggunaan / Contoh API

Base URL: `https://api.roboedu.id/api/v1` (mengikuti `docs/api.md`).

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
    "user": {
      "id": "...",
      "name": "Budi Santoso",
      "role": "CUSTOMER",
      "reseller_status": "NOT_RESELLER"
    }
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

Seluruh endpoint (autentikasi, produk, cart, checkout, pembayaran, pengiriman, review, klaim garansi, reseller, admin) didokumentasikan lengkap di `docs/api.md`, termasuk format request/response, kode error, dan aturan header (mis. `Idempotency-Key` wajib pada `POST /orders` dan `POST /payments/*`).

---

## Status Pengembangan

Project saat ini berada pada fase **UI implementation + backend integration prep**. Beberapa catatan penting:

- Database schema sudah final di Drizzle ORM/MySQL (folder `src/db/schema` + migration `drizzle/0000_*.sql`).
- API specification (`docs/api.md`) sudah mencakup 18 bagian, diselaraskan dengan schema kodebase.
- **3 diskrepansi antara kodebase dan PRD masih perlu diputuskan** sebelum tim frontend sepenuhnya mengonsumsi API (lihat `docs/api.md` §18):
  1. Model shipment (`shipment`/`shipment_tracking` terpisah vs. kolom langsung di `order`)
  2. Penamaan status klaim garansi (`OPEN` di kodebase vs. `SUBMITTED/IN_REVIEW/RESOLVED/REJECTED` di PRD)
  3. Granularitas role admin (`CUSTOMER`/`ADMIN` di kodebase vs. `superadmin/admin_sales/admin_laporan` di PRD)
- Tim frontend saat ini membangun UI sesuai design referensi di `docs/stitch/` (Hero, Navbar, Carousel, Product Card, Order History, Login/Register, dll.)
- **Docker stack (hari ini) sudah siap pakai:** setup script auto + compose 5 container + hot reload siap untuk onboarding anggota tim baru tanpa setup manual.

---

## Troubleshooting — FAQ

### 1. Error: `dependency failed to start: container robo-edu-app-1 is unhealthy`

**Gejala:** `docker compose up -d` keluar dengan pesan di atas, dan `docker compose ps -a` menunjukkan app status `(unhealthy)`.

**Langkah diagnosis:**

```bash
# Lihat log app untuk error detail
docker compose logs app --tail=100
```

**Kemungkinan penyebab & solusi:**

- **`Couldn't find any pages or app directory`** → Build image kamu lawas. Solusi: `docker compose build app --no-cache && docker compose up -d`
- **`EACCES permission denied, open '/app/next-env.d.ts'`** → Permission bind mount. Secara DEFAULT compose sudah set `APP_USER:-0:0` (root user) sehingga ini tidak terjadi lagi. Jika kamu override `APP_USER` menjadi nilai lain, set kembali ke `0:0` atau kosongkan.
- **Health check timeout padahal app jalan lambat** → Nyalakan ulang dengan start_period yang lebih panjang, atau upgrade PC/RAM alokasi Docker Desktop. Default start_period adalah 90 detik (cukup untuk kebanyakan laptop modern).

---

### 2. Bagaimana cara akses MySQL dari host (misal pakai DBeaver / Navicat)?

Default compose **tidak expose** port MySQL ke host, ini sengaja untuk hindari konflik port 3306 lokal. Cara buka:

1. Edit `docker-compose.yml`, uncomment 2 baris pada service `mysql`:
   ```yaml
   mysql:
     # ...
     ports:
       - "3307:3306" # host port 3307 → container 3306
   ```
2. Restart: `docker compose up -d`
3. Koneksikan DBeaver dengan: **Host=127.0.0.1**, **Port=3307**, **Database=roboedu**, **User=roboedu**, **Password=** isi `DB_PASSWORD` dari file `.env`.

---

### 3. Port 80 sudah dipakai (tidak bisa start nginx)

Override port nginx di `.env`:

```env
NGINX_HTTP_PORT=8080
NGINX_HTTPS_PORT=8443
```

Kemudian `docker compose up -d`. Nginx sekarang di **http://localhost:8080**.

---

### 4. App tidak berubah ketika saya edit file di lokal (hot reload tidak jalan)

Pastikan:

- Kamu **tidak** menghapus section `volumes:` pada service `app` di `docker-compose.yml`. Volume itulah yang melakukan bind mount source code lokal ke container.
- Kamu edit file di folder yang benar: `app/`, `components/`, `contexts/`, `lib/`, `src/`, `types/` → semuanya sudah dimount.
- Di Windows/WSL2: terkadang ada delay file system events (Next.js menampilkan warning `Slow filesystem detected`). Ini normal, hot reload tetap jalan cuma agak lambat ~1-3 detik. Solusi permanen: clone repo di dalam filesystem WSL2 (bukan `/mnt/c/`).

---

### 5. Ingin RESET TOTAL database (hapus semua data)

⚠️ **DESTRUCTIVE — semua data di MySQL/Redis/MinIO akan hilang permanen:**

```bash
docker compose down -v
docker compose up -d --build   # pertama kali recreate empty volume
```

Kemudian jalankan migration: `docker compose exec app npm run db:migrate` (jika tidak auto).

---

### 6. Error `npm install` lambat atau gagal di stage build docker

Jalankan dengan network host (hanya untuk Linux native), atau perbaiki konfigurasi DNS Docker Desktop. Atau tambahkan mirror npm di `.npmrc` sebelum copy package.json — tapi ini jarang dibutuhkan.

---

## Panduan Kontribusi

1. Buat branch baru dari `main`/`develop` dengan format `feature/nama-fitur` atau `fix/nama-bug`.
2. Ikuti konvensi API pada `docs/rest-api-standards-v2.md` untuk perubahan apa pun yang menyentuh endpoint (URL kebab-case, field `snake_case`, UUID v4 untuk ID publik, dll.).
3. Sebelum membuat Pull Request:
   ```bash
   # 1. Jalankan lint (WAJIB — tidak ada eslint-disable!)
   npm run lint
   # 2. Build production (cek TypeScript + route compile)
   npm run build
   # 3. Manual testing: buka app, klik semua route group penting
   docker compose up -d --build
   ```
4. Tulis pesan commit yang jelas, contoh: `feat: add cart item validation`, `fix: correct shipment status enum`.
5. Setiap perubahan pada schema database wajib disertai migration Drizzle ORM yang di-generate, direview, dan dicatat di version control — bukan dijalankan otomatis di background.
6. Jika perubahan memengaruhi struktur data (mis. menghapus/menambah tabel), pastikan perubahan tersebut disebarkan ke seluruh dokumen terkait (schema, ERD, PRD, `docs/api.md`).
7. Ajukan Pull Request dengan deskripsi singkat perubahan dan tag reviewer terkait.

---

## Lisensi

Proyek ini bersifat **proprietary/internal** untuk kebutuhan pengembangan RoboEdu. Belum ditentukan lisensi open-source publik. Hubungi pemilik project untuk izin penggunaan di luar konteks pengembangan ini.
