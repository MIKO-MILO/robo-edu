CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`phone` varchar(30),
	`role` enum('CUSTOMER','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
	`reseller_status` enum('NOT_RESELLER','PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'NOT_RESELLER',
	`reseller_approved_at` timestamp,
	`is_active` boolean NOT NULL DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `user_address` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`label` varchar(100),
	`recipient_name` varchar(255) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`address` varchar(500) NOT NULL,
	`province` varchar(100) NOT NULL,
	`city` varchar(100) NOT NULL,
	`district` varchar(100) NOT NULL,
	`village` varchar(100),
	`postal_code` varchar(10),
	`is_primary` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_address_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`image_url` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `category_id` PRIMARY KEY(`id`),
	CONSTRAINT `category_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` varchar(36) NOT NULL,
	`category_id` varchar(36) NOT NULL,
	`product_type_id` varchar(36),
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`sku` varchar(100) NOT NULL,
	`description` text,
	`status` enum('DRAFT','ACTIVE','INACTIVE','OUT_OF_STOCK') NOT NULL DEFAULT 'DRAFT',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `product_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `product_image` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`variant_id` varchar(36),
	`image_url` varchar(500) NOT NULL,
	`alt_text` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_primary` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_image_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_type` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_type_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_type_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product_variant` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`variant_name` varchar(255) NOT NULL,
	`sku` varchar(100) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`reseller_price` decimal(12,2),
	`stock` int NOT NULL DEFAULT 0,
	`weight` decimal(10,2),
	`status` enum('DRAFT','ACTIVE','INACTIVE','OUT_OF_STOCK') NOT NULL DEFAULT 'DRAFT',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_variant_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_variant_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `cart` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_id` PRIMARY KEY(`id`),
	CONSTRAINT `cart_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `cart_item` (
	`id` varchar(36) NOT NULL,
	`cart_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`variant_id` varchar(36),
	`quantity` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_item_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlist` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wishlist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voucher` (
	`id` varchar(36) NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`discount_type` enum('PERCENTAGE','FIXED_AMOUNT') NOT NULL,
	`discount_value` decimal(12,2) NOT NULL,
	`minimum_purchase` decimal(12,2),
	`maximum_discount` decimal(12,2),
	`usage_limit` int,
	`used_count` int NOT NULL DEFAULT 0,
	`start_at` timestamp,
	`end_at` timestamp,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voucher_id` PRIMARY KEY(`id`),
	CONSTRAINT `voucher_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `voucher_usage` (
	`id` varchar(36) NOT NULL,
	`voucher_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`discount_amount` decimal(12,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `voucher_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order` (
	`id` varchar(36) NOT NULL,
	`order_number` varchar(50) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`address_id` varchar(36) NOT NULL,
	`voucher_id` varchar(36),
	`subtotal` decimal(12,2) NOT NULL,
	`discount_amount` decimal(12,2) NOT NULL DEFAULT '0',
	`shipping_cost` decimal(12,2) NOT NULL DEFAULT '0',
	`total` decimal(12,2) NOT NULL,
	`voucher_code_snapshot` varchar(50),
	`status` enum('PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','COMPLETED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
	`recipient_name` varchar(255) NOT NULL,
	`recipient_phone` varchar(30) NOT NULL,
	`shipping_address` varchar(500) NOT NULL,
	`shipping_province` varchar(100) NOT NULL,
	`shipping_city` varchar(100) NOT NULL,
	`shipping_district` varchar(100) NOT NULL,
	`shipping_village` varchar(100),
	`shipping_postal_code` varchar(10),
	`paid_at` timestamp,
	`shipped_at` timestamp,
	`delivered_at` timestamp,
	`completed_at` timestamp,
	`cancelled_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_id` PRIMARY KEY(`id`),
	CONSTRAINT `order_order_number_unique` UNIQUE(`order_number`)
);
--> statement-breakpoint
CREATE TABLE `order_item` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`variant_id` varchar(36),
	`product_name_snapshot` varchar(255) NOT NULL,
	`variant_name_snapshot` varchar(255),
	`sku_snapshot` varchar(100) NOT NULL,
	`price_snapshot` decimal(12,2) NOT NULL,
	`quantity` int NOT NULL,
	`subtotal` decimal(12,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_item_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`transaction_id` varchar(255) NOT NULL,
	`payment_type` varchar(50) NOT NULL,
	`status` enum('PENDING','PAID','FAILED','EXPIRED','REFUNDED') NOT NULL DEFAULT 'PENDING',
	`amount` decimal(12,2) NOT NULL,
	`transaction_time` timestamp,
	`settlement_time` timestamp,
	`expiry_time` timestamp,
	`fraud_status` varchar(50),
	`raw_response` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_order_id_unique` UNIQUE(`order_id`),
	CONSTRAINT `payment_transaction_id_unique` UNIQUE(`transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `shipment` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`shipping_provider_id` varchar(36) NOT NULL,
	`service` varchar(100),
	`tracking_number` varchar(100),
	`status` varchar(50) NOT NULL DEFAULT 'PENDING',
	`shipped_at` timestamp,
	`delivered_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipment_id` PRIMARY KEY(`id`),
	CONSTRAINT `shipment_order_id_unique` UNIQUE(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `shipment_tracking` (
	`id` varchar(36) NOT NULL,
	`shipment_id` varchar(36) NOT NULL,
	`status` varchar(50) NOT NULL,
	`description` varchar(255),
	`location` varchar(255),
	`occurred_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shipment_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shipping_provider` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipping_provider_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review` (
	`id` varchar(36) NOT NULL,
	`order_item_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`status` varchar(50) NOT NULL DEFAULT 'PUBLISHED',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `review_id` PRIMARY KEY(`id`),
	CONSTRAINT `review_order_item_id_unique` UNIQUE(`order_item_id`)
);
--> statement-breakpoint
CREATE TABLE `complaint_attachments` (
	`id` varchar(36) NOT NULL,
	`complaint_id` varchar(36) NOT NULL,
	`file_url` varchar(500) NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_type` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complaint_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complaints` (
	`id` varchar(36) NOT NULL,
	`order_item_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'OPEN',
	`resolution` text,
	`resolved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complaints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` varchar(36) NOT NULL,
	`actor_id` varchar(36) NOT NULL,
	`action` varchar(100) NOT NULL,
	`target_type` varchar(100) NOT NULL,
	`target_id` varchar(36) NOT NULL,
	`description` varchar(500),
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_log` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36),
	`user_id` varchar(36),
	`email` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'PENDING',
	`sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_address` ADD CONSTRAINT `user_address_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product` ADD CONSTRAINT `product_category_id_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product` ADD CONSTRAINT `product_product_type_id_product_type_id_fk` FOREIGN KEY (`product_type_id`) REFERENCES `product_type`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_image` ADD CONSTRAINT `product_image_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_image` ADD CONSTRAINT `product_image_variant_id_product_variant_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_variant`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_variant` ADD CONSTRAINT `product_variant_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart` ADD CONSTRAINT `cart_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_item` ADD CONSTRAINT `cart_item_cart_id_cart_id_fk` FOREIGN KEY (`cart_id`) REFERENCES `cart`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_item` ADD CONSTRAINT `cart_item_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_item` ADD CONSTRAINT `cart_item_variant_id_product_variant_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_variant`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlist` ADD CONSTRAINT `wishlist_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlist` ADD CONSTRAINT `wishlist_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `voucher_usage` ADD CONSTRAINT `voucher_usage_voucher_id_voucher_id_fk` FOREIGN KEY (`voucher_id`) REFERENCES `voucher`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `voucher_usage` ADD CONSTRAINT `voucher_usage_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `voucher_usage` ADD CONSTRAINT `voucher_usage_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order` ADD CONSTRAINT `order_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order` ADD CONSTRAINT `order_address_id_user_address_id_fk` FOREIGN KEY (`address_id`) REFERENCES `user_address`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order` ADD CONSTRAINT `order_voucher_id_voucher_id_fk` FOREIGN KEY (`voucher_id`) REFERENCES `voucher`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_variant_id_product_variant_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_variant`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment` ADD CONSTRAINT `payment_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipment` ADD CONSTRAINT `shipment_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipment` ADD CONSTRAINT `shipment_shipping_provider_id_shipping_provider_id_fk` FOREIGN KEY (`shipping_provider_id`) REFERENCES `shipping_provider`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipment_tracking` ADD CONSTRAINT `shipment_tracking_shipment_id_shipment_id_fk` FOREIGN KEY (`shipment_id`) REFERENCES `shipment`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review` ADD CONSTRAINT `review_order_item_id_order_item_id_fk` FOREIGN KEY (`order_item_id`) REFERENCES `order_item`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review` ADD CONSTRAINT `review_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review` ADD CONSTRAINT `review_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaint_attachments` ADD CONSTRAINT `complaint_attachments_complaint_id_complaints_id_fk` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_order_item_id_order_item_id_fk` FOREIGN KEY (`order_item_id`) REFERENCES `order_item`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_actor_id_user_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_log` ADD CONSTRAINT `email_log_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_log` ADD CONSTRAINT `email_log_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;