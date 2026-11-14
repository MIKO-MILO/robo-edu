-- ================================================================
-- 0005_payment_refund_migration.sql
-- ----------------------------------------------------------------
-- Ticket: 01-schema-migration-payment-refund
--
-- Changes (three interdependent areas, landed atomically):
--   1. payments — multi-attempt support + column renames
--      a. Drop UNIQUE(transaction_id)
--      b. Rename transaction_id → midtrans_transaction_id (nullable)
--      c. Add midtrans_order_id VARCHAR(150) NOT NULL UNIQUE
--      d. Add attempt_number INT NOT NULL DEFAULT 1
--      e. Add payment_method, payment_channel VARCHAR(50) nullable
--      f. Add payment_instruction JSON nullable
--      g. Add payer_phone_number VARCHAR(30) nullable
--      h. Add composite indexes (order_id, attempt_number) and
--         (membership_purchase_id, attempt_number)
--
--   2. orders — add expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL 24 HOUR)
--
--   3. refunds — new table
--      id, payment_id (FK), order_id (nullable FK),
--      membership_purchase_id (nullable FK), amount, reason, method,
--      proof_url, restore_quota, processed_by (FK user), status,
--      created_at, updated_at
--
--   4. settings — seed payment_methods_config and order_expires_hours
-- ================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ──────────────────────────────────────────────────────────────
-- 1. payments — multi-attempt + rename
-- ──────────────────────────────────────────────────────────────

-- 1a. Drop the unique index on transaction_id
ALTER TABLE `payments`
  DROP INDEX `payments_transaction_id_unique`;

-- 1b. Add midtrans_order_id column (nullable first, populate, then make NOT NULL)
ALTER TABLE `payments`
  ADD COLUMN `midtrans_order_id` VARCHAR(150) NULL AFTER `membership_purchase_id`;

-- 1c. Copy existing transaction_id values to midtrans_order_id
--    (the old transaction_id stored the Midtrans order reference / order number
--     as a placeholder, which is semantically the midtrans_order_id)
UPDATE `payments` SET `midtrans_order_id` = `transaction_id` WHERE `midtrans_order_id` IS NULL;

-- 1d. Make midtrans_order_id NOT NULL and add unique index
ALTER TABLE `payments`
  MODIFY COLUMN `midtrans_order_id` VARCHAR(150) NOT NULL;

CREATE UNIQUE INDEX `payments_midtrans_order_id_unique` ON `payments` (`midtrans_order_id`);

-- 1e. Rename transaction_id → midtrans_transaction_id
ALTER TABLE `payments`
  CHANGE COLUMN `transaction_id` `midtrans_transaction_id` VARCHAR(150) NULL;

-- 1f. Add attempt_number column (default 1 for existing rows)
ALTER TABLE `payments`
  ADD COLUMN `attempt_number` INT NOT NULL DEFAULT 1 AFTER `midtrans_transaction_id`;

-- 1g. Add payment_method, payment_channel
ALTER TABLE `payments`
  ADD COLUMN `payment_method`   VARCHAR(50) NULL AFTER `payment_type`,
  ADD COLUMN `payment_channel`  VARCHAR(50) NULL AFTER `payment_method`;

-- 1h. Add payment_instruction (JSON) and payer_phone_number
ALTER TABLE `payments`
  ADD COLUMN `payment_instruction`  JSON NULL AFTER `payment_channel`,
  ADD COLUMN `payer_phone_number`   VARCHAR(30) NULL AFTER `payment_instruction`;

-- 1i. Add composite indexes for multi-attempt lookup
CREATE INDEX `payments_order_attempt_idx`
  ON `payments` (`order_id`, `attempt_number`);
CREATE INDEX `payments_membership_attempt_idx`
  ON `payments` (`membership_purchase_id`, `attempt_number`);

-- ──────────────────────────────────────────────────────────────
-- 2. orders — add expires_at
-- ──────────────────────────────────────────────────────────────

ALTER TABLE `orders`
  ADD COLUMN `expires_at` DATETIME NOT NULL DEFAULT (NOW() + INTERVAL 24 HOUR) AFTER `cancelled_at`;

-- ──────────────────────────────────────────────────────────────
-- 3. refunds — new table
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `refunds` (
  `id`                       VARCHAR(36)    NOT NULL,
  `payment_id`               VARCHAR(36)    NOT NULL,
  `order_id`                 VARCHAR(36)    NULL,
  `membership_purchase_id`   VARCHAR(36)    NULL,
  `amount`                   DECIMAL(15, 2) NOT NULL,
  `reason`                   TEXT           NOT NULL,
  `method`                   VARCHAR(20)    NOT NULL,
  `proof_url`                VARCHAR(500)   NULL,
  `restore_quota`            BOOLEAN        NOT NULL DEFAULT FALSE,
  `processed_by`             VARCHAR(36)    NOT NULL,
  `status`                   VARCHAR(30)    NOT NULL DEFAULT 'PENDING',
  `created_at`               DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`               DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `refunds_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `refunds_payment_id_payments_id_fk`
    FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `refunds_order_id_orders_id_fk`
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `refunds_membership_purchase_id_fk`
    FOREIGN KEY (`membership_purchase_id`) REFERENCES `membership_purchase`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `refunds_processed_by_users_id_fk`
    FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX `refunds_payment_id_idx`             ON `refunds` (`payment_id`);
CREATE INDEX `refunds_order_id_idx`               ON `refunds` (`order_id`);
CREATE INDEX `refunds_membership_purchase_id_idx`  ON `refunds` (`membership_purchase_id`);
CREATE INDEX `refunds_processed_by_idx`           ON `refunds` (`processed_by`);

-- ──────────────────────────────────────────────────────────────
-- 4. settings — seed new keys
-- ──────────────────────────────────────────────────────────────

INSERT INTO `settings` (`key`, `value`) VALUES
  ('order_expires_hours', '24'),
  ('payment_methods_config', '{"bca_va":true,"bni_va":true,"bri_va":true,"mandiri_va":true,"permata_va":true,"cimb_va":true,"credit_card":true,"gopay":true,"shopeepay":true,"qris":true,"dana":true,"ovo":true,"alfamart":true,"indomaret":true}')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

SET FOREIGN_KEY_CHECKS = 1;
