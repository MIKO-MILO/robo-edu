# Penyesuaian Halaman Customer dengan Backend — Implementation Plan

## Repository Research

### Kondisi Saat Ini (Masih Mock Data)
1. **List Customer** (`app/(admin)/admin/customers/page.tsx`)
   - Data diambil dari `MOCK_ADMIN_CUSTOMERS` (file `components/admin/customers/mock-data.ts`)
   - Filter/search dilakukan client-side via `useMemo`
   - Statistik KPI dihitung dari `getCustomerStats(MOCK_ADMIN_CUSTOMERS)`

2. **Detail Customer** (`app/(admin)/admin/customers/[id]/page.tsx`)
   - Data diambil dari `getMockCustomerDetail(id)`
   - Menampilkan: header profil, metric cards (LTV, Total Orders, AOV), tabs (Orders, Complaints, Reviews), profile card + addresses

3. **Field yang dibutuhkan UI vs User type dasar**
   - `AdminCustomerRow` (tabel list) membutuhkan: `total_orders`, `total_spent` (LTV), `last_order_at`, `last_order_status` — field ini **TIDAK ADA** di tipe `User` dasar
   - `AdminCustomerDetailData` membutuhkan: `metrics` (aggregate), `addresses[]`, `orders[]`, `complaints[]`, `reviews[]` — nested relasi

### Yang Sudah Ada Siap Pakai
- `userService` di `lib/api/services/user.service.ts`:
  - `getAdminUsers(params)` → `GET /admin/users` (list user dasar, filter role/reseller_status/search)
  - `getAdminUserById(id)` → `GET /admin/users/{id}` (detail user, menurut api.md §3 "Detail user + histori order ringkas")
  - `updateUserStatus(id, is_active)` → `PATCH /admin/users/{id}/status`
  - `updateUserResellerStatus(id, reseller_status)` → `PATCH /admin/users/{id}/reseller-status`
- DB schema `users` memiliki field: `gender`, `taxIdentificationNumber`, `taxIdentificationCountry`, `avatarKey` (sesuai `src/db/schema/user.ts`)
- Relations user: `addresses`, `orders`, `reviews`, `complaints` (sesuai `src/db/relations/user.ts`)

### Asumsi Kontrak Backend (Sementara)
Karena endpoint `/admin/users` kemungkinan baru mengembalikan `User[]` dasar **tanpa aggregate order stats**, maka:
- **List Customer**: Fetch `getAdminUsers` + fetch ringkasan orders per user secara paralel (atau mapping seadanya sementara)
- **Detail Customer**: Gunakan `getAdminUserById` + jika nested relasi (addresses, orders) belum dikembalikan, fetch via endpoint orders/complaints/reviews dengan filter user_id
- Jika nanti BE sudah menambahkan field aggregate di response, cukup ubah mapping layer di service tanpa ubah hook/component

---

## Files and Modules

| Path | Expected Change |
| --- | --- |
| `types/user.ts` | Tambah tipe alias untuk customer aggregate (opsional, atau di customer-list-types) |
| `components/admin/customers/customer-list-types.ts` | Tambah mapping function: `mapUserToCustomerRow`, `mapUserDetailToAdminCustomerDetailData`; sesuaikan field name (DB `resellerStatus` → UI `reseller_status`) |
| `lib/api/services/user.service.ts` | Tambah 2 method: `getAdminCustomers` (wrap getAdminUsers + aggregate sementara), `getAdminCustomerDetail` (wrap getAdminUserById + fetch relasi lain jika perlu) |
| `hooks/admin/customers/index.ts` | **NEW** — barrel export |
| `hooks/admin/customers/use-customers.ts` | **NEW** — useQuery list customers (mirip use-categories.ts) |
| `hooks/admin/customers/use-customer.ts` | **NEW** — useQuery detail customer by id |
| `hooks/admin/customers/use-update-user-status.ts` | **NEW** — useMutation aktif/nonaktif user |
| `hooks/admin/customers/use-update-reseller-status.ts` | **NEW** — useMutation setujui/tolak reseller |
| `app/(admin)/admin/customers/page.tsx` | Ganti `MOCK_ADMIN_CUSTOMERS` dengan data dari `useCustomers`; gunakan server-side search/filter via params; tambah handle error/loading |
| `app/(admin)/admin/customers/[id]/page.tsx` | Ganti `getMockCustomerDetail` dengan `useCustomer`; tambah loading/error; aktifkan tombol status/reseller (jika ada) |
| `components/admin/customers/customer-detail-header.tsx` | (Opsional) Tambah prop untuk action toggle status & reseller |

---

## Implementation Steps

### Step 1 — Tambah Type Mapping Layer
1. Buka `customer-list-types.ts`, tambah function:
   - `mapUserToCustomerRow(user: User, orderSummary?: {...}): AdminCustomerRow`
     - Mapping `taxIdentificationNumber` → `tax_id`, `taxIdentificationCountry` → `tax_country`, `avatarKey` → (URL via storage util jika ada, atau `avatar_url: null` sementara)
     - Jika order summary tidak tersedia, set `total_spent: 0`, `total_orders: 0`, `last_order_at: null`
   - `mapUserAndRelationsToCustomerDetail(user, addresses, orders, complaints, reviews): AdminCustomerDetailData`
     - Hitung `metrics` dari orders array (total_spent = SUM total, completed_orders = COUNT status COMPLETED/DELIVERED, dll)

### Step 2 — Perluas userService untuk Customer
Di `lib/api/services/user.service.ts`:
1. Export interface `AdminCustomersQueryParams extends AdminUsersQueryParams` (sama saja untuk sementara)
2. Tambah method `getAdminCustomers(params?)`:
   - Panggil `getAdminUsers(params)`
   - Return `data: users.map(mapUserToCustomerRow)` + meta as-is
3. Tambah method `getAdminCustomerDetail(id: string)`:
   - Panggil `getAdminUserById(id)` sebagai dasar
   - (Sementara, jika nested relasi tidak ada di response) Jalankan paralel:
     - `orderService.getOrders({ user_id: id, limit: 100 })`
     - `userService.getAddresses` — TIDAK BISA (hanya untuk owner) → sementara untuk list addresses di detail customer, gunakan endpoint admin khusus atau kembalikan array kosong sambil menunggu BE (catat TODO)
     - `complaintService.getComplaints` (cek apakah ada admin endpoint)
     - `reviewService.getReviews` (cek apakah bisa filter user_id)
   - Mapping hasil ke `AdminCustomerDetailData`
   - **Catatan fallback**: Jika endpoint admin untuk addresses/complaints/reviews per user belum ada, tampilkan apa yang tersedia dari `getAdminUserById` dan kosongkan sisanya dengan empty state + TODO comment

### Step 3 — Buat Hooks Customer (Tanstack Query)
Buat folder `hooks/admin/customers/` dengan 4 file:
1. `use-customers.ts`: `useQuery({ queryKey: ["admin", "customers", params], queryFn: () => userService.getAdminCustomers(params), staleTime: 60_000 })`
2. `use-customer.ts`: `useQuery({ queryKey: ["admin", "customers", id], queryFn: () => userService.getAdminCustomerDetail(id), enabled: !!id })`
3. `use-update-user-status.ts`: `useMutation({ mutationFn: ({id, is_active}) => userService.updateUserStatus(id, is_active), onSuccess: invalidate ["admin","customers"] & ["admin","customers",id] })`
4. `use-update-reseller-status.ts`: `useMutation({ mutationFn: ({id, reseller_status}) => userService.updateUserResellerStatus(id, reseller_status), onSuccess: invalidate queries })`
5. `index.ts`: Export semua hooks

### Step 4 — Integrasi Halaman List Customer
Ubah `app/(admin)/admin/customers/page.tsx`:
1. Import `useCustomers` dari hooks
2. Panggil hook dengan params: `{ search: searchQuery, reseller_status: resellerFilter === "CUSTOMER" ? undefined : (resellerFilter !== "ALL" ? resellerFilter : undefined), role: "customer" }`
   - Tambahkan mapping filter: UI `resellerFilter === "CUSTOMER"` berarti `reseller_status = "NOT_RESELLER"`
   - Tambahkan filter `is_active` jika statusFilter !== "ALL"
3. Ganti `MOCK_ADMIN_CUSTOMERS` → `data?.data ?? []` (hasil useQuery)
4. Gunakan `meta.total_count` dari response untuk text "Menampilkan X dari Y"
5. Gunakan `data?.data` untuk hitung `stats` di client-side (sementara, sebelum BE sediakan stats endpoint terpisah)
6. Terapkan loading state: gunakan `isLoading` hook, lewatkan `isLoading` ke `<CustomerTable>`
7. Tambah error handling ringkas: jika `isError`, tampilkan alert/pesan error

### Step 5 — Integrasi Halaman Detail Customer
Ubah `app/(admin)/admin/customers/[id]/page.tsx`:
1. Import `useCustomer`, `useUpdateUserStatus`, `useUpdateResellerStatus`
2. Panggil `const { data, isLoading, isError } = useCustomer(id)`
3. Tambah loading skeleton saat `isLoading`
4. Tambah error state saat `isError`
5. Ganti `getMockCustomerDetail(id)` → `data?.data` (atau data sesuai amplop response)
6. Pastikan akses `customer.metrics`, `customer.addresses`, `customer.orders`, `customer.complaints`, `customer.reviews` memiliki fallback ke `[]` atau `null`

### Step 6 — Perbarui Komponen Pendukung
1. `customer-table.tsx`: Pastikan sudah handle `isLoading` prop (sudah ada, tinggal pastikan wired dengan benar)
2. `customer-detail-header.tsx`: (Opsional) Jika ada tombol "Aktifkan/Nonaktifkan" atau "Setujui/Tolak Reseller", sambungkan mutation hooks
3. `customer-stats.tsx`: Tidak perlu ubah (hanya render data dari props)

### Step 7 — Mapping Field Name Discrepancies
Periksa mapping field di DB schema `users` vs UI types:
| DB (Drizzle camelCase) | Tipe User (types/user.ts snake_case) | UI customer-list-types |
| --- | --- | --- |
| `resellerStatus` | `reseller_status` | `reseller_status` ✓ |
| `resellerApprovedAt` | `reseller_approved_at` | `reseller_approved_at` ✓ |
| `isActive` | `is_active` | `is_active` ✓ |
| `lastLoginAt` | `last_login_at` | `last_login_at` ✓ |
| `createdAt` | `created_at` | `created_at` ✓ |
| `taxIdentificationNumber` | **TIDAK ADA** di types/user.ts → perlu ditambahkan field opsional | `tax_id` |
| `taxIdentificationCountry` | **TIDAK ADA** di types/user.ts → perlu ditambahkan field opsional | `tax_country` |
| `gender` | **TIDAK ADA** di types/user.ts → perlu ditambahkan field opsional | `gender` |
| `avatarKey` | **TIDAK ADA** di types/user.ts → perlu ditambahkan field opsional | `avatar_url` (URL, bukan key) |

**Action**: Tambahkan field berikut ke interface `User` di `types/user.ts` sebagai optional:
- `gender?: "MALE" | "FEMALE" | "OTHER" | null`
- `tax_id?: string | null` (atau `taxIdentificationNumber` lalu mapping di layer service)
- `tax_country?: string | null`
- `avatar_url?: string | null` (mapping runtime dari avatarKey via helper)

*(Pilih: lebih baik nama field di types/user.ts SELALU snake_case sesuai JSON response BE, jadi tambahkan dengan nama `gender`, `tax_id`, `tax_country`, `avatar_url` semua opsional.)*

---

## Dependencies and Considerations
- **Tanstack React Query**: Sudah tersedia (lihat `use-categories.ts`, `use-products.ts`), tinggal ikuti pola yang sama
- **Search/Filter**: Saat ini filter dilakukan client-side. Pindahkan ke query params (server-side) dengan meneruskan `search`, `reseller_status`, `is_active` ke `params` hook; sisi BE harus mendukungnya (sesuai api.md §1.5: `search` + filter spesifik)
- **Fallback Endpoint Belum Ada**: Jika BE belum menyediakan `/admin/users/{id}/addresses`, `/admin/complaints?user_id=...`, dll — UI akan menampilkan empty array dengan comment `// TODO: fetch admin addresses/complaints/reviews endpoint when available`
- **Pagination**: Sementara untuk list customer, belum ada pagination UI; lewatkan `page` dan `limit` default saja (mis. `page: 1, limit: 50`)
- **Reseller Status Enum Mapping**: DB schema default `reseller_status = "none"` sedangkan UI enum = `"NOT_RESELLER"`. Mapping di service layer: `"none"` → `"NOT_RESELLER"` (jika BE memang kirim "none"). Ini perlu dicek via actual response.

---

## Validation
1. **TypeScript Build**: Jalankan `npx tsc --noEmit` — pastikan tidak ada type error
2. **ESLint**: Jalankan `npx eslint app/(admin)/admin/customers components/admin/customers hooks/admin/customers lib/api/services/user.service.ts types/user.ts` — pastikan tidak ada eslint error dan TIDAK ada `eslint-disable` yang ditambahkan
3. **Dev Server Smoke Test**: Buka `/admin/customers` — pastikan:
   - Loading skeleton muncul saat fetch berjalan
   - Data muncul (walau kosong / dari BE)
   - Search input & filter chip merubah URL query params
   - Klik row / tombol Detail navigasi ke `/admin/customers/{id}`
   - Halaman detail menampilkan loading → data → error jika id salah
4. **Hook Invalidasi**: Setelah panggil mutation (update status / reseller), list & detail otomatis refresh

---

## Risks
| Risiko | Handling / Fallback |
| --- | --- |
| BE endpoint `/admin/users` tidak mendukung `search` / `reseller_status` / `is_active` filter | Tetap kirim params; jika BE abaikan, lakukan filter client-side sebagai fallback (wrap `data?.data.filter(...)` sama seperti sekarang tapi source dari API) |
| BE response user tidak punya field aggregate `total_spent` dll | Tetap mapping dengan nilai `0` / `null`; UI kolom Total Belanja tetap tampil tapi 0. Catat TODO di kode agar tim backend menambahkan aggregate select |
| Detail user tidak mengembalikan nested `addresses`/`orders`/`complaints`/`reviews` | Fetch orders via `orderService.getAdminOrders({ user_id: id })` (jika tersedia); sisanya tampilkan empty state dengan pesan "Data belum tersedia" |
| Enum `reseller_status` value mismatch ("none" vs "NOT_RESELLER") | Buat helper normalisasi `normalizeResellerStatus(val)` yang mapping "none"/null → "NOT_RESELLER" di layer service sebelum dikirim ke UI |
