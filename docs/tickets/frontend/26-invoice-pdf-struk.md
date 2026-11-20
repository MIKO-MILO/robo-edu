# 26: Invoice — Hapus Tombol Cetak & Implementasi Unduh PDF Struk

**What to build:** Dua perubahan pada komponen invoice di halaman detail order user:

**Hapus tombol Cetak** — Tombol "Cetak" (ikon `Printer`) dihapus dari UI. Hanya tersisa satu tombol aksi: "Unduh PDF".

**Implementasi Unduh PDF bergaya struk** — Tombol "Unduh PDF" saat ini hanya memanggil `window.print()`. Ganti dengan implementasi sesungguhnya menggunakan `html2canvas` + `jsPDF` (atau `@react-pdf/renderer` jika sudah ada di dependencies — periksa `package.json` terlebih dahulu). Layout struk yang diunduh bersifat vertikal compact, bergaya struk kasir:
- Header: logo atau nama toko "RoboEdu", tulisan "INVOICE RESMI"
- Metadata: nomor pesanan, tanggal, nama penerima, alamat, metode pembayaran
- Tabel item: nama produk, qty, harga satuan, subtotal
- Ringkasan: subtotal produk, biaya pengiriman, diskon voucher (jika ada), total
- Footer: ucapan terima kasih
- Lebar kertas: A5 portrait atau setara struk (sesuaikan agar tidak terlalu sempit)

Klik "Unduh PDF" langsung men-trigger download file `.pdf` bernama `invoice-[nomor-order].pdf` tanpa dialog print browser.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [ ] Tombol "Cetak" tidak ada lagi di tampilan invoice.
- [ ] Klik "Unduh PDF" men-trigger download file PDF (bukan membuka dialog print browser).
- [ ] File PDF yang diunduh berformat struk vertikal dengan semua section: header, metadata, tabel item, ringkasan, footer.
- [ ] Nama file PDF adalah `invoice-[nomor-order].pdf`.
- [ ] Konten PDF akurat sesuai data order (nama produk, harga, total, dsb).
