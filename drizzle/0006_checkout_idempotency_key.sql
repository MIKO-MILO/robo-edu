-- ================================================================
-- 0006_checkout_idempotency_key.sql
-- ----------------------------------------------------------------
-- Ticket: payment/03 — POST /checkout Core API
--
-- Adds orders.idempotency_key (nullable varchar, unique) so the
-- checkout endpoint can detect and return a previous result when
-- the same Idempotency-Key header is re-submitted (network retry).
-- ================================================================

SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `orders`
  ADD COLUMN `idempotency_key` VARCHAR(100) NULL AFTER `expires_at`;

CREATE UNIQUE INDEX `orders_idempotency_key_unique`
  ON `orders` (`idempotency_key`);

SET FOREIGN_KEY_CHECKS = 1;
