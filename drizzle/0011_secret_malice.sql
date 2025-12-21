CREATE TABLE `eventFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`attended` int NOT NULL,
	`accuracyRating` int,
	`helpfulDetails` json,
	`inaccurateDetails` json,
	`comments` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`syncedToClickUp` int NOT NULL DEFAULT 0,
	`clickUpSyncedAt` timestamp,
	CONSTRAINT `eventFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateName` varchar(255) NOT NULL,
	`description` text,
	`templateData` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eventTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizerImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` text NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`description` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organizerImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `status` enum('pending','published','rejected','needs-clarification','closed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `events` ADD `hasUnreviewedEdit` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `pendingEditData` text;--> statement-breakpoint
ALTER TABLE `events` ADD `clickupTaskId` text;