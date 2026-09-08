ALTER TABLE `users`
  ADD COLUMN `gender` varchar(20),
  ADD COLUMN `tax_identification_number` varchar(100),
  ADD COLUMN `tax_identification_country` varchar(100),
  ADD COLUMN `residential_address` text;
