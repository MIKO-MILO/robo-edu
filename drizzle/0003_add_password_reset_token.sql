-- Migration: add password_reset_token and password_reset_expires_at to users
-- These columns support the forgot-password / reset-password flow.

ALTER TABLE `users`
  ADD COLUMN `password_reset_token` VARCHAR(255) NULL AFTER `last_login_at`,
  ADD COLUMN `password_reset_expires_at` DATETIME NULL AFTER `password_reset_token`;
