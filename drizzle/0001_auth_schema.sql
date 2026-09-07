-- ================================================================
-- 0001_auth_schema.sql
-- ----------------------------------------------------------------
-- Skema autentikasi RoboEdu: users + user_addresses
-- Cocok dengan Drizzle schema di src/db/schema/user.ts & user-address.ts
--
-- CATATAN: Migration 0000_fancy_hitman.sql membuat tabel `users` versi
-- awal (id INT AUTO_INCREMENT, kolom terbatas). Karena project masih
-- tahap development dan tipe PK berubah (INT → UUID VARCHAR(36)),
-- migration ini melakukan DROP + CREATE ulang untuk users dan
-- user_addresses. Jika sudah ada data penting di tabel users lama,
-- backup terlebih dahulu sebelum menjalankan.
-- ================================================================

-- Foreign key harus dimatikan sementara agar DROP tidak error
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `user_addresses`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ──────────────────────────────────────────────────────────────
-- TABEL: users
-- ──────────────────────────────────────────────────────────────
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(30),
  `role` varchar(30) NOT NULL DEFAULT 'CUSTOMER',
  `reseller_status` varchar(30) NOT NULL DEFAULT 'NOT_RESELLER',
  `reseller_approved_at` datetime,
  `is_active` boolean NOT NULL DEFAULT true,
  `email_verified_at` datetime,
  `verification_token` varchar(255),
  `password_reset_token` varchar(255),
  `password_reset_expires_at` datetime,
  `last_login_at` datetime,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `users_pkey` PRIMARY KEY(`id`),
  CONSTRAINT `users_email_unique` UNIQUE(`email`)
);

CREATE INDEX `users_phone_idx` ON `users` (`phone`);
CREATE INDEX `users_verification_token_idx` ON `users` (`verification_token`);
CREATE INDEX `users_password_reset_token_idx` ON `users` (`password_reset_token`);

-- ──────────────────────────────────────────────────────────────
-- TABEL: user_addresses
-- ──────────────────────────────────────────────────────────────
CREATE TABLE `user_addresses` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `label` varchar(50),
  `recipient_name` varchar(150) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `address` text NOT NULL,
  `province` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `village` varchar(100),
  `postal_code` varchar(10),
  `is_primary` boolean NOT NULL DEFAULT false,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `user_addresses_pkey` PRIMARY KEY(`id`)
);

CREATE INDEX `user_addresses_user_id_idx` ON `user_addresses` (`user_id`);

ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_user_id_users_id_fk`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE cascade ON UPDATE cascade;
