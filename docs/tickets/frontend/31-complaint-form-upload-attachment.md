# 31: UI upload attachment di form complaint user

**What to build:** Form complaint di halaman orders user saat ini tidak memiliki komponen upload sama sekali — padahal backend (`POST /api/complaints`) dan tabel `complaint_attachments` sudah siap menerima attachment. Tiket ini menambahkan komponen upload file ke form tersebut, lalu menyertakan URL-URL hasil upload ke payload `attachments` saat submit.

**Blocked by:** backend/27 — endpoint `POST /api/upload/complaint-image` harus ada sebelum UI bisa menggunakannya

**Status:** done

- [x] Form complaint memiliki area upload file yang mendukung pilih file (JPEG/PNG/WEBP/PDF, maks 3 file, maks 10 MB per file)
- [x] Setiap file yang dipilih langsung diupload ke `POST /api/upload/complaint-image` dan hasilnya (URL) ditampilkan sebagai preview
- [x] Preview menampilkan nama file dan tombol hapus untuk membatalkan attachment sebelum submit
- [x] Saat submit, field `attachments` dikirim ke `POST /api/complaints` sebagai array `{ file_url, file_name, file_type }`
- [x] Jika upload gagal, pesan error ditampilkan di dekat komponen upload (bukan halaman error)
- [x] Tombol submit form dinonaktifkan selama ada file yang sedang diupload
