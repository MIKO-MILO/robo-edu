-- ================================================================
-- 0008_refund_attachments.sql
-- ----------------------------------------------------------------
-- Ticket: 23-complaint-refund-attachment-and-wa-fix
--
-- Creates refund_attachments table so user-facing refund requests
-- can include multiple attachment files (pre-uploaded to MinIO).
-- Follows the same pattern as complaint_attachments.
-- ================================================================

CREATE TABLE IF NOT EXISTS `refund_attachments` (
  `id`         VARCHAR(36)  NOT NULL,
  `refund_id`  VARCHAR(36)  NOT NULL,
  `file_url`   VARCHAR(500) NOT NULL,
  `file_name`  VARCHAR(255) NOT NULL,
  `file_type`  VARCHAR(100) NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `refund_attachments_refund_id_idx` (`refund_id`),
  CONSTRAINT `refund_attachments_refund_id_fk`
    FOREIGN KEY (`refund_id`) REFERENCES `refunds` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);
