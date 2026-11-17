# 07: Wire admin complaints page ke real API

**What to build:** Halaman `/admin/complaints` dan `/admin/complaints/[id]` saat ini menggunakan `MOCK_ADMIN_COMPLAINTS` dan `getMockComplaintDetail()` — tidak ada API call sama sekali. Backend `GET /api/admin/complaints`, `GET /api/admin/complaints/[id]`, dan `PATCH /api/admin/complaints/[id]` sudah tersedia (backend ticket 15). Ticket ini mengganti seluruh data layer untuk fetch dari API nyata.

**Blocked by:** None (backend API sudah ada)

**Status:** done

- [x] Halaman `/admin/complaints` fetch dari `GET /api/admin/complaints` dengan query params `search`, `status`, `page`, `limit`; tidak lagi import atau gunakan `MOCK_ADMIN_COMPLAINTS`.
- [x] Statistik KPI (total, open, in_review, resolved) diambil dari response API — bukan dari `getComplaintStats()` yang menghitung dari array mock.
- [x] Pagination server-side menggunakan `meta.total_count` dari response API.
- [x] Loading state dan empty state ditampilkan dengan benar.
- [x] Halaman `/admin/complaints/[id]` fetch dari `GET /api/admin/complaints/[id]`; tidak lagi gunakan `getMockComplaintDetail()`.
- [x] Aksi update status dan catatan resolusi di halaman detail memanggil `PATCH /api/admin/complaints/[id]` dan memperbarui UI setelah berhasil.
- [x] File `components/admin/complaints/mock-data.ts` tidak lagi diimpor dari halaman manapun.

## Catatan implementasi

- **Status casing**: Backend menyimpan status lowercase (`open`, `in_review`, `resolved`, `closed`). FE enum tetap uppercase (`OPEN`, `IN_REVIEW`, `RESOLVED`, `REJECTED`). Konversi dilakukan di service layer dan di halaman — tidak mengubah tipe FE yang sudah ada.
- **`closed` → `REJECTED`**: Backend menggunakan `closed` sebagai status terminal penolakan; dipetakan ke `REJECTED` di FE untuk konsistensi dengan label UI yang sudah ada.
- **Field `resolution_note`**: PATCH backend membaca `resolution_note`, bukan `resolution`. Method `patchAdminComplaint()` baru di service sudah menggunakan field name yang benar. Method lama `updateComplaintStatus()` dipertahankan sebagai `@deprecated`.
- **`order_number` di list**: Endpoint list tidak meng-join tabel `orders`, sehingga `order_number` tidak tersedia. Kolom tersebut diisi sementara dengan `order_item.id`. Order number lengkap hanya tersedia di detail endpoint.
- **KPI stats**: Tidak ada endpoint stats terpisah. Stats `total` diambil dari `meta.total_count`; `open`/`in_review`/`resolved` dihitung dari baris di halaman aktif (bukan grand total per status).
- **`media_type` lampiran**: Field ini tidak dikirim oleh backend; diderivasi client-side lewat `deriveMediaType(file_type)` setelah fetch.
- **File yang diubah**: `lib/api/services/complaint.service.ts`, `app/(admin)/admin/complaints/page.tsx`, `app/(admin)/admin/complaints/[id]/page.tsx`, `components/admin/complaints/complaint-table.tsx`, `components/admin/complaints/index.ts`, `components/admin/index.ts`, `hooks/admin/complaints/use-complaints.ts`.
