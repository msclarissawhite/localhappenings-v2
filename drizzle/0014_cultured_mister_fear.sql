CREATE TABLE `eventEditHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`adminId` int NOT NULL,
	`adminName` text,
	`changedFields` json,
	`editedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventEditHistory_id` PRIMARY KEY(`id`)
);
