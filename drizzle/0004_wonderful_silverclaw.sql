ALTER TABLE `events` ADD `municipality` varchar(150) NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `neighborhoodCommunity` varchar(150);--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `city`;--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `neighborhood`;