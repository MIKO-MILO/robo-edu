# 14: Fix admin customers — tombol export CSV yang benar-benar download file

**What to build:** Halaman `/admin/customers` memiliki tombol "Export CSV" yang saat ini hanya menampilkan `alert("Data pelanggan berhasil diunduh sebagai file CSV.")` tanpa menghasilkan atau mendownload file apapun. Ticket ini menggantinya dengan export yang nyata.

**Blocked by:** None

**Status:** done

- [x] Tombol "Export CSV" mengambil semua data pelanggan yang sesuai filter aktif saat ini (search query, reseller filter, status filter) dari `GET /api/admin/users` tanpa pagination (atau dengan limit besar).
- [x] Data dikonversi ke format CSV di client-side: kolom minimal mencakup Nama, Email, Telepon, Status, Membership Status, Tanggal Daftar.
- [x] File didownload otomatis dengan nama `pelanggan-roboedu-{tanggal}.csv`.
- [x] Tombol menampilkan loading state selama fetch berlangsung dan tidak bisa ditekan ganda.
- [x] Jika data kosong (tidak ada pelanggan yang cocok filter), tombol tetap berfungsi dan menghasilkan file CSV dengan hanya header kolom.

## Implementation notes

**Files changed:**
- `app/(admin)/admin/customers/page.tsx` — replaced `alert()` stub with real async `handleExport`; added `isExporting` state; button shows `Loader2` spinner + "Mengekspor..." and is `disabled` while fetching.
- `lib/api/services/user.service.ts` — added `getAdminCustomersForExport()` method that calls `GET /api/admin/users` with active filters, `limit: 200` (API max), `page: 1`.

**Behaviour:**
- Export reads the same `search`, `membership`, `status` URL params already used by the table, so the downloaded file always matches what the user is looking at.
- CSV is built client-side with RFC 4180-compliant escaping (values containing commas, quotes, or newlines are double-quoted).
- A UTF-8 BOM (`\uFEFF`) is prepended so Excel opens the file without encoding issues.
- Empty result → file still downloads with the six header columns and no data rows.
- Commit: `feat: implement real CSV export on admin customers page (#14)`
