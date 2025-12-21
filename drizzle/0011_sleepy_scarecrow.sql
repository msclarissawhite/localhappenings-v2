ALTER TABLE `events` ADD `hasUnreviewedEdit` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `pendingEditData` text;