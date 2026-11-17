-- ================================================================
-- 0007_normalize_payment_methods_config.sql
-- ----------------------------------------------------------------
-- Fix: admin "Kelola Pembayaran" availability did not affect the
-- guest-side payment methods.
--
-- Root cause: the admin UI wrote `payment_methods_config` as an
-- object-per-channel blob (e.g. {"bank_transfer":{"enabled":true}})
-- with method-level keys, while the public GET /payment-methods
-- endpoint reads a flat { channel: boolean } blob keyed by channel.
-- After the first admin save the two shapes diverged and the admin
-- toggles stopped affecting checkout entirely.
--
-- This migration resets the blob to the canonical default: a flat
-- { channel: boolean } object over the 12 supported channels (GoPay
-- QRIS and ShopeePay QRIS removed), all active. The admin UI now reads
-- and writes this exact shape, so toggles take effect immediately.
--
-- Existing toggles are discarded — they never functioned anyway.
-- ================================================================

INSERT INTO `settings` (`key`, `value`) VALUES
  ('payment_methods_config', '{"bca_va":true,"bni_va":true,"bri_va":true,"mandiri_va":true,"permata_va":true,"cimb_va":true,"credit_card":true,"qris":true,"dana":true,"ovo":true,"alfamart":true,"indomaret":true}')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
