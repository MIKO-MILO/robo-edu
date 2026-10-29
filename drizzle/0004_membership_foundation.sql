-- ================================================================
-- 0004_membership_foundation.sql
-- ----------------------------------------------------------------
-- Fase 1.1 — schema foundation for membership system
-- Ticket: 01-schema-migration-foundation
--
-- Changes:
--   1. users: rename reseller_status → membership_status (NOT_MEMBER/MEMBER)
--              rename reseller_approved_at → membership_expires_at
--   2. CREATE TABLE membership_purchase
--   3. CREATE TABLE settings (key-value) + seed rows
--   4. payments: make order_id nullable, add membership_purchase_id FK
--   5. orders: add is_dropship, sender_name, sender_phone
--   6. product_variants: make reseller_price nullable, add low_stock_threshold
-- ================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ──────────────────────────────────────────────────────────────
-- 1. users — rename reseller columns to membership columns
-- ──────────────────────────────────────────────────────────────

-- Rename reseller_status → membership_status and update default + values
ALTER TABLE `users`
  CHANGE COLUMN `reseller_status` `membership_status` VARCHAR(30) NOT NULL DEFAULT 'NOT_MEMBER';

-- Map old values to new values:
--   NOT_RESELLER / none / not  → NOT_MEMBER
--   APPROVED                   → MEMBER
--   PENDING / REJECTED         → NOT_MEMBER  (transitional — no pending state in new system)
UPDATE `users`
  SET `membership_status` = CASE
    WHEN `membership_status` IN ('NOT_RESELLER', 'none', 'not', 'REJECTED', 'PENDING') THEN 'NOT_MEMBER'
    WHEN `membership_status` = 'APPROVED' THEN 'MEMBER'
    ELSE 'NOT_MEMBER'
  END;

-- Rename reseller_approved_at → membership_expires_at
-- Old semantic: timestamp when reseller was approved (past)
-- New semantic: timestamp when current membership expires (future)
-- We can't reliably convert old data, so we NULL it out — admin can re-enter.
ALTER TABLE `users`
  CHANGE COLUMN `reseller_approved_at` `membership_expires_at` DATETIME NULL DEFAULT NULL;

UPDATE `users` SET `membership_expires_at` = NULL;

-- ──────────────────────────────────────────────────────────────
-- 2. CREATE TABLE membership_purchase
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `membership_purchase` (
  `id`                      VARCHAR(36)       NOT NULL,
  `purchase_number`         VARCHAR(100)      NOT NULL,
  `user_id`                 VARCHAR(36)       NOT NULL,
  `payment_id`              VARCHAR(36)       NULL,
  `price_snapshot`          DECIMAL(15, 2)    NOT NULL,
  `duration_months_snapshot` INT              NOT NULL,
  `plan_name_snapshot`      VARCHAR(100)      NOT NULL,
  `starts_at`               DATETIME          NULL,
  `ends_at`                 DATETIME          NULL,
  `paid_at`                 DATETIME          NULL,
  `reminder_h7_sent_at`     DATETIME          NULL,
  `reminder_h3_sent_at`     DATETIME          NULL,
  `status`                  VARCHAR(30)       NOT NULL DEFAULT 'PENDING',
  `created_at`              DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `membership_purchase_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `membership_purchase_purchase_number_unique` UNIQUE (`purchase_number`)
);

CREATE INDEX `membership_purchase_user_id_idx`   ON `membership_purchase` (`user_id`);
CREATE INDEX `membership_purchase_status_idx`    ON `membership_purchase` (`status`);

ALTER TABLE `membership_purchase`
  ADD CONSTRAINT `membership_purchase_user_id_users_id_fk`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `membership_purchase_payment_id_payments_id_fk`
    FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ──────────────────────────────────────────────────────────────
-- 3. CREATE TABLE settings + seed
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `settings` (
  `key`        VARCHAR(100) NOT NULL,
  `value`      TEXT         NOT NULL,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `settings_pkey` PRIMARY KEY (`key`)
);

INSERT INTO `settings` (`key`, `value`) VALUES
  ('membership_plus_price',          '299000'),
  ('membership_plus_duration_months','12'),
  ('store_name',                     'RoboEdu'),
  ('store_phone',                    ''),
  ('store_email',                    ''),
  ('store_address',                  '')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ──────────────────────────────────────────────────────────────
-- 4. payments — make order_id nullable, add membership_purchase_id
-- ──────────────────────────────────────────────────────────────

-- Drop FK on order_id first (required before dropping the unique index)
ALTER TABLE `payments`
  DROP FOREIGN KEY `payments_order_id_orders_id_fk`;

-- Drop the existing unique index on order_id (was NOT NULL + UNIQUE)
ALTER TABLE `payments`
  DROP INDEX `payments_order_id_unique`;

-- Make order_id nullable
ALTER TABLE `payments`
  MODIFY COLUMN `order_id` VARCHAR(36) NULL;

-- Add membership_purchase_id column
ALTER TABLE `payments`
  ADD COLUMN `membership_purchase_id` VARCHAR(36) NULL AFTER `order_id`;

-- Re-add a non-unique index on order_id for join performance
CREATE INDEX `payments_order_id_idx` ON `payments` (`order_id`);
CREATE INDEX `payments_membership_purchase_id_idx` ON `payments` (`membership_purchase_id`);

-- Re-add the FK for order_id (now nullable, so uses ON DELETE SET NULL)
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_order_id_orders_id_fk`
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- FK for membership_purchase_id (deferred until table exists — added after CREATE TABLE above)
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_membership_purchase_id_fk`
    FOREIGN KEY (`membership_purchase_id`) REFERENCES `membership_purchase`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ──────────────────────────────────────────────────────────────
-- 5. orders — add dropship columns
-- ──────────────────────────────────────────────────────────────

ALTER TABLE `orders`
  ADD COLUMN `is_dropship`  BOOLEAN      NOT NULL DEFAULT FALSE AFTER `cancelled_at`,
  ADD COLUMN `sender_name`  VARCHAR(150) NULL     AFTER `is_dropship`,
  ADD COLUMN `sender_phone` VARCHAR(30)  NULL     AFTER `sender_name`;

-- ──────────────────────────────────────────────────────────────
-- 6. product_variants — make reseller_price nullable, add low_stock_threshold
-- ──────────────────────────────────────────────────────────────

-- Make reseller_price nullable (was NOT NULL)
ALTER TABLE `product_variants`
  MODIFY COLUMN `reseller_price` DECIMAL(15, 2) NULL;

-- Add low_stock_threshold column
ALTER TABLE `product_variants`
  ADD COLUMN `low_stock_threshold` INT NOT NULL DEFAULT 0 AFTER `stock`;

SET FOREIGN_KEY_CHECKS = 1;
