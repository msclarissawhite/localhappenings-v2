CREATE TABLE `homepageFeaturedEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepageFeaturedEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `homepageFeaturedEvents` ADD CONSTRAINT `homepageFeaturedEvents_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;