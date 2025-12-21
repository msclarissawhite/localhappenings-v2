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
