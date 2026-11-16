# 06: Wire admin resellers page ke real API

**What to build:** Halaman `/admin/resellers` saat ini menggunakan `MOCK_ADMIN_RESELLERS` dari file mock-data lokal — semua filter, pagination, dan statistik dihitung dari array statis. Backend `GET /api/admin/resellers` dan `GET /api/admin/resellers/[id]` sudah tersedia dan berfungsi (backend ticket 12). Ticket ini mengganti seluruh data layer di halaman list dan halaman detail reseller untuk fetch dari API nyata.

**Blocked by:** None (backend API sudah ada)

**Status:** done

- [x] Halaman `/admin/resellers` fetch data dari `GET /api/admin/resellers` dengan query params `search`, `status`, `page`, `limit`; tidak lagi import atau gunakan `MOCK_ADMIN_RESELLERS`.
- [x] Statistik KPI (total member, aktif, expired, dll) dihitung dari response API atau endpoint terpisah — bukan dari array lokal.
- [x] Pagination server-side menggunakan `meta.total_count` dari response API.
- [x] Loading state dan empty state ditampilkan dengan benar saat data sedang fetch atau kosong.
- [x] Halaman `/admin/resellers/[id]` fetch dari `GET /api/admin/resellers/[id]`; tidak lagi gunakan `getMockResellerDetail()`.
- [x] Aksi approve/reject di halaman detail memanggil `PATCH /api/admin/resellers/[id]` (endpoint sudah ada).
- [x] File `components/admin/membership/mock-data.ts` tidak lagi diimpor dari halaman manapun (boleh tetap ada sebagai referensi tapi tidak digunakan).
