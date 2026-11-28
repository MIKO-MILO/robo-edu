-- Migration: Landing Page CMS tables
-- Ticket 36: DB schema & API — landing page CMS config

-- ─────────────────────────────────────────────────────────────────────────────
-- landing_page_config
-- Singleton row (id = 'singleton') menyimpan seluruh konten teks landing.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `landing_page_config` (
  `id`         VARCHAR(36)  NOT NULL,
  `hero`       JSON,
  `about`      JSON,
  `info_cards` JSON,
  `marquee`    JSON,
  `video_demo` JSON,
  `faq`        JSON,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pk_landing_page_config` PRIMARY KEY (`id`)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- landing_featured_vouchers
-- Maks. 6 baris aktif. FK ke vouchers.id (CASCADE delete/update).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `landing_featured_vouchers` (
  `id`         VARCHAR(36)  NOT NULL,
  `voucher_id` VARCHAR(36)  NOT NULL,
  `sort_order` INT          NOT NULL DEFAULT 0,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pk_landing_featured_vouchers` PRIMARY KEY (`id`),
  CONSTRAINT `fk_lfv_voucher_id`
    FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `lfv_voucher_id_idx` (`voucher_id`),
  INDEX `lfv_sort_order_idx` (`sort_order`)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- landing_featured_reviews
-- FK ke reviews.id (CASCADE delete/update).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `landing_featured_reviews` (
  `id`         VARCHAR(36)  NOT NULL,
  `review_id`  VARCHAR(36)  NOT NULL,
  `sort_order` INT          NOT NULL DEFAULT 0,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pk_landing_featured_reviews` PRIMARY KEY (`id`),
  CONSTRAINT `fk_lfr_review_id`
    FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `lfr_review_id_idx` (`review_id`),
  INDEX `lfr_sort_order_idx` (`sort_order`)
);
