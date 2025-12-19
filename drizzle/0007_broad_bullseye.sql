CREATE TABLE `savedEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventId` int NOT NULL,
	`reminderPreference` enum('none','24h','48h','both') NOT NULL DEFAULT '24h',
	`reminder24hSent` int NOT NULL DEFAULT 0,
	`reminder48hSent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savedEvents_id` PRIMARY KEY(`id`)
);
