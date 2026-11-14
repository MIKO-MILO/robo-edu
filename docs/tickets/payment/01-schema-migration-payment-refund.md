# 01: Migrasi schema — payment multi-attempt, order expires_at, tabel refund

**What to build:** Migrasi Drizzle ORM yang mengubah tiga area schema sekaligus, karena ketiganya saling terkait dan tidak bisa dilandingkan setengah-setengah tanpa break TypeScript build. Perombakan tabel payment: hapus constraint UNIQUE(order_id) dan UNIQUE(transaction_id); jadikan order_id nullable; tambah membership_purchase_id (nullable FK ke membership_purchase dari backend ticket 01); tambah attempt_number INT, midtrans_order_id VARCHAR UNIQUE, payment_method VARCHAR, payment_channel VARCHAR, payment_instruction JSON NULLABLE, payer_phone_number VARCHAR NULLABLE; rename transaction_id → midtrans_transaction_id; tambah index komposit (order_id, attempt_number) dan (membership_purchase_id, attempt_number). Tambah kolom di tabel order: expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL 24 HOUR). Buat tabel refund baru: id, payment_id (FK payment), order_id (nullable FK), membership_purchase_id (nullable FK), amount DECIMAL, reason TEXT, method ENUM('MIDTRANS_API','MANUAL'), proof_url VARCHAR NULLABLE, restore_quota BOOLEAN DEFAULT FALSE, processed_by (FK user), created_at. Tambah keys baru ke tabel settings: payment_methods_config (JSON default semua channel aktif) dan order_expires_hours (default "24"). Update semua TS types (payment.ts, order.ts, enums.ts) dan semua insert site yang sebelumnya memasukkan order_id NOT NULL ke payment. Build dan migration hijau.

**Blocked by:** backend/01 (tabel membership_purchase dan settings sudah harus ada)

**Status:** done

- [x] Tabel payment tidak lagi memiliki UNIQUE(order_id) atau UNIQUE(transaction_id); order_id nullable; semua kolom baru hadir.
- [x] midtrans_order_id memiliki constraint UNIQUE (satu ID unik per percobaan ke Midtrans).
- [x] Tabel refund ada dengan semua kolom yang didefinisikan, FK valid.
- [x] order.expires_at ada dengan default 24 jam.
- [x] settings memiliki baris payment_methods_config dan order_expires_hours.
- [x] Semua TS types diperbarui; npm run build hijau tanpa type error.
- [x] Migration Drizzle berjalan bersih (db:migrate) tanpa data loss pada baris payment yang sudah ada (kolom baru nullable atau punya default).
