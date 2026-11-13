# 07: Wire admin complaints page ke real API

**What to build:** Halaman `/admin/complaints` dan `/admin/complaints/[id]` saat ini menggunakan `MOCK_ADMIN_COMPLAINTS` dan `getMockComplaintDetail()` — tidak ada API call sama sekali. Backend `GET /api/admin/complaints`, `GET /api/admin/complaints/[id]`, dan `PATCH /api/admin/complaints/[id]` sudah tersedia (backend ticket 15). Ticket ini mengganti seluruh data layer untuk fetch dari API nyata.

**Blocked by:** None (backend API sudah ada)

**Status:** ready-for-agent

- [ ] Halaman `/admin/complaints` fetch dari `GET /api/admin/complaints` dengan query params `search`, `status`, `page`, `limit`; tidak lagi import atau gunakan `MOCK_ADMIN_COMPLAINTS`.
- [ ] Statistik KPI (total, open, in_review, resolved) diambil dari response API — bukan dari `getComplaintStats()` yang menghitung dari array mock.
- [ ] Pagination server-side menggunakan `meta.total_count` dari response API.
- [ ] Loading state dan empty state ditampilkan dengan benar.
- [ ] Halaman `/admin/complaints/[id]` fetch dari `GET /api/admin/complaints/[id]`; tidak lagi gunakan `getMockComplaintDetail()`.
- [ ] Aksi update status dan catatan resolusi di halaman detail memanggil `PATCH /api/admin/complaints/[id]` dan memperbarui UI setelah berhasil.
- [ ] File `components/admin/complaints/mock-data.ts` tidak lagi diimpor dari halaman manapun.
