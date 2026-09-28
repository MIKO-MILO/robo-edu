# RoboEdu — Codebase Project Structure

Dokumen ini memetakan arsitektur folder, hierarki berkas, dan tanggung jawab setiap modul dalam repositori **RoboEdu**.

---

## 1. Ikhtisar Arsitektur

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Custom Neo-brutalism Design Tokens ([`app/globals.css`](file:///d:/goldipekael/robo-edu/app/globals.css))
- **Komponen UI**: Base UI / Radix primitives (`@base-ui/react`, `lucide-react`, CVA, `tailwind-merge`)
- **Pola Desain**: Feature-driven components & Type-first API abstraction

---

## 2. Diagram Struktur Direktori

```text
robo-edu/
├── app/                           # Next.js App Router (Halaman & Routing)
│   ├── (admin)/                   # Route group khusus Admin Dashboard
│   ├── (auth)/                    # Route group Autentikasi (Login & Register)
│   ├── (user)/                    # Route group Customer / Publik
│   │   ├── about/                 # Halaman Tentang Kami
│   │   ├── cart/                  # Halaman Keranjang Belanja & Rekomendasi
│   │   ├── contact/               # Halaman Hubungi Kami & Form Masukan
│   │   ├── product/               # Halaman Katalog & Detail Produk
│   │   └── profile/               # Halaman Profil, Pesanan, & Pengaturan
│   ├── favicon.ico
│   ├── globals.css                # Design tokens (Neo-brutalism colors, borders, shadows)
│   ├── layout.tsx                 # Root layout aplikasi
│   └── page.tsx                   # Homepage / Landing page utama
│
├── components/                    # Reusable React Components
│   ├── auth/                      # Komponen halaman autentikasi
│   ├── ui/                        # Komponen atomik/dasar (Button, Input, Modal, dll.)
│   └── user/                      # Komponen domain customer
│       ├── about/                 # Bagian halaman About (Story, Values, Kid-Safe)
│       ├── contact/               # Bagian halaman Contact (Form, Social Cards)
│       ├── landing/               # Komponen Homepage (Hero, FAQ, Testimoni, Video Demo)
│       ├── orders/                # Komponen Pesanan (Card, Invoice Modal, Tracking Modal)
│       ├── products/              # Komponen Katalog Produk & Filter
│       ├── profile/               # Komponen Profil (Sidebar navigasi)
│       ├── wishlist/              # Komponen Wishlist (FAB, Slide-over Drawer)
│       ├── carousel-logo.tsx      # Carousel logo partner/institusi
│       ├── footer.tsx             # Footer global customer
│       └── navbar.tsx             # Navbar navigasi melayang customer
│
├── contexts/                      # React Context Providers
│   └── wishlist-context.tsx       # State management global untuk Wishlist
│
├── docs/                          # Dokumentasi Spesifikasi & Panduan Teknis
│   ├── DESIGN.md                  # Spesifikasi Desain Visual & Neo-brutalism Tokens
│   ├── PRD.md                     # Product Requirement Document utama
│   ├── RoboEdu_Content_Requirement_Orders.md # Kebutuhan konten halaman Orders
│   ├── STRUCTURE.md               # Dokumentasi struktur codebase (dokumen ini)
│   ├── api.md                     # Spesifikasi REST API & Kontrak Endpoint
│   ├── rest-api-standards-v2.md   # Standar & konvensi REST API
│   └── stitch/                    # Asset mockup & referensi visual
│
├── lib/                           # Utility & Helper Functions
│   ├── mock/                      # Mock data layer untuk pengujian lokal
│   ├── orders/                    # Helper logika pemrosesan pesanan
│   └── utils.ts                   # Helper styling (cn / clsx / twMerge)
│
├── public/                        # Static Assets (Gambar, Icon, SVG)
│   ├── assets/
│   │   ├── images/                # Asset gambar promosi & avatar
│   │   └── svg/                   # Vector logo, ikon, dan dekorasi neo-brutalis
│   └── images/                    # Asset foto produk edukasi
│
├── types/                         # TypeScript Type Definitions & API Contracts
│   ├── admin.ts                   # DTO Admin, Dashboard, AuditLog, EmailLog
│   ├── cart.ts                    # Tipe data Cart & CartItem
│   ├── catalog.ts                 # Tipe data Category, Product, Variant, Image
│   ├── common.ts                  # Primitive types, ApiResponse, Pagination
│   ├── complaint.ts               # Tipe data Klaim Garansi & Attachments
│   ├── contact.ts                 # Tipe data formulir kontak & media sosial
│   ├── enums.ts                   # Seluruh enum sistem (Status, Role, dsb.)
│   ├── index.ts                   # Entry point ekspor seluruh tipe
│   ├── order.ts                   # Tipe data Order, Item, Payment, Shipment, Resi
│   ├── review.ts                  # Tipe data Ulasan & Rating Produk
│   ├── user.ts                    # Tipe data User, Profil, Alamat, Auth DTO
│   ├── voucher.ts                 # Tipe data Voucher Promo & VoucherUsage
│   └── wishlist.ts                # Tipe data Wishlist Item
│
├── .env.example                   # Template konfigurasi environment variable
├── components.json                # Konfigurasi shadcn/base-ui CLI
├── eslint.config.mjs              # Konfigurasi linting ESLint
├── next.config.ts                 # Konfigurasi Next.js
├── package.json                   # Daftar dependensi & npm scripts
├── postcss.config.mjs             # Konfigurasi PostCSS Tailwind
└── tsconfig.json                  # Konfigurasi TypeScript compiler
```

---

## 3. Rincian Direktori Utama

### 3.1. `app/` (Next.js App Router)
Menggunakan konvensi *Route Groups* dengan tanda kurung `(group)` untuk memisahkan layout dan hak akses:

- **`app/page.tsx`**: Landing page utama yang mengintegrasikan Hero Section, Value Proposition, Carousel Produk, Video Demo, Testimoni, FAQ, dan Footer.
- **`app/(auth)/`**: Layout bersih khusus alur masuk dan pendaftaran:
  - `login/page.tsx`: Formulir login email/password dengan visual neo-brutalist.
  - `register/page.tsx`: Formulir registrasi akun customer baru.
- **`app/(user)/`**: Menggunakan layout global customer (`layout.tsx` dengan Navbar & Footer):
  - `about/`: Halaman profil RoboEdu, sertifikasi aman anak (*Kid-Safe*), dan nilai brand.
  - `cart/`: Halaman keranjang belanja, kalkulasi kuantitas, input voucher diskon, dan cross-selling produk rekomendasi.
  - `contact/`: Formulir kontak langsung customer dan daftar kartu media sosial resmi.
  - `product/`: Katalog produk lengkap dengan pencarian dan filter kategori.
  - `product/[slug]/`: Halaman detail produk dinamis (galeri foto produk multi-angle, detail spesifikasi, rincian komponen bawaan, ulasan pembeli, dan tombol beli langsung).
  - `profile/`:
    - `my-profile/`: Data diri customer dan pengelolaan alamat penerima.
    - `orders/`: Riwayat pemesanan dengan tab status (*Diproses, Dikirim, Selesai, Dibatalkan*), filter periode, dan aksi modal.
    - `orders/{id}/`: Halaman detail pesanan individual.
    - `settings/`: Pengaturan preferensi akun.
- **`app/(admin)/`**: Fondasi rute dashboard operasional admin.

---

### 3.2. `components/` (Komponen Antarmuka)

Komponen dipisahkan secara modular berdasarkan peruntukannya:

#### A. `components/ui/` (Komponen Atomik & Reusable)
- **`button.tsx`**: Tombol dengan dukungan mode `neo` (shadow tebal `4px 4px 0px #3D2900` dan efek klik aktif).
- **`badge.tsx`**: Label badge status pesanan dan kategori produk.
- **`dialog.tsx` / `sheet.tsx`**: Primitif modal dan drawer samping.
- **`product-card.tsx` / `product-image.tsx`**: Kartu produk standar dengan bingkai kontras dan manajemen fallback gambar.
- **`pagination.tsx`**: Navigasi halaman untuk daftar pesanan atau katalog produk.
- **`star-rating.tsx`**: Komponen bintang rating presisi (mendukung *half star*).

#### B. `components/user/orders/` (Fitur Pesanan Customer)
- **`order-card.tsx`**: Kartu pesanan individu lengkap dengan badge status dan aksi kontekstual.
- **`order-invoice-modal.tsx`**: Modal ringkasan faktur/invoice digital transaksi.
- **`order-tracking-modal.tsx`**: Modal pelacakan kurir interaktif dengan riwayat titik perjalanan paket.
- **`order-review-modal.tsx`**: Modal instan untuk mengirimkan penilaian dan review produk yang telah diterima.
- **`order-status-tabs.tsx` & `order-period-select.tsx`**: Kontrol filter status dan jangka waktu pesanan.

#### C. `components/user/wishlist/` (Fitur Wishlist)
- **`wishlist-sidebar.tsx`**: Panel slide-over untuk menampilkan item yang disimpan.
- **`wishlist-fab.tsx`**: Tombol melayang cepat untuk membuka drawer wishlist.
- **`wishlist-item-card.tsx`**: Kartu produk di dalam panel wishlist.

#### D. `components/user/landing/` (Komponen Beranda)
- **`hero-section.tsx`**: Banner utama bertema petualangan edukasi robotika.
- **`card-info.tsx`**: Nilai keunggulan (Kurikulum STEM, Aman Anak, Perakitan Mudah).
- **`faq.tsx`**: Accordion FAQ dan banner informasi garansi.
- **`video-demo.tsx`**: Demonstrasi produk robot bergerak.
- **`testimoni.tsx`**: Testimoni dan pengalaman dari orang tua serta pendidik.

---

### 3.3. `types/` (Kontrak Data & TypeScript Interfaces)

Semua entitas data telah distandarisasi untuk mencerminkan skema database dan respon REST API:

- **`enums.ts`**: Sumber kebenaran untuk seluruh enum sistem (`UserRole`, `ResellerStatus`, `ProductStatus`, `OrderStatus`, `PaymentStatus`, `ShipmentStatus`, `ComplaintStatus`).
- **`catalog.ts`**: Entitas `Product`, `ProductVariant`, `Category`, `ProductType`, dan `ProductImage`.
- **`order.ts`**: Entitas `Order` (termasuk snapshot alamat lengkap), `OrderItem`, `Payment`, `Shipment`, `ShipmentTracking`, dan DTO transaksi.
- **`complaint.ts`**: Entitas klaim garansi (`Complaint`, `ComplaintAttachment`).
- **`admin.ts`**: Entitas pelaporan admin, ringkasan dashboard, `AuditLog`, dan `EmailLog`.
- **`contact.ts`**: Tipe data pengiriman formulir masukan dan kartu media sosial.
- **`user.ts`**: Entitas `User`, `UserAddress`, dan DTO autentikasi.

---

### 3.4. `contexts/` (State Management Global)

- **`wishlist-context.tsx`**: Mengelola status wishlist secara global menggunakan `useReducer`. Mendukung penyimpanan lokal (`localStorage`) untuk fase *pre-backend* dan dirancang agar transisi ke REST API nantinya bersifat *drop-in replacement*.

---

### 3.5. `docs/` (Dokumentasi Proyek)

- **[`PRD.md`](file:///d:/goldipekael/robo-edu/docs/PRD.md)**: Dokumen Kebutuhan Produk (Product Requirement Document).
- **[`DESIGN.md`](file:///d:/goldipekael/robo-edu/docs/DESIGN.md)**: Panduan sistem desain visual, tipografi, dan warna Neo-brutalism.
- **[`api.md`](file:///d:/goldipekael/robo-edu/docs/api.md)**: Spesifikasi lengkap REST API endpoint v1.
- **[`rest-api-standards-v2.md`](file:///d:/goldipekael/robo-edu/docs/rest-api-standards-v2.md)**: Standar format JSON, penanganan error, dan status HTTP.
- **[`RoboEdu_Content_Requirement_Orders.md`](file:///d:/goldipekael/robo-edu/docs/RoboEdu_Content_Requirement_Orders.md)**: Spesifikasi UI dan alur bisnis modul pesanan.
- **[`STRUCTURE.md`](file:///d:/goldipekael/robo-edu/docs/STRUCTURE.md)**: Pemetaan arsitektur dan struktur codebase ini.
