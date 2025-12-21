CREATE TABLE `eventTypeClicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventTypeId` int NOT NULL,
	`clickedAt` timestamp NOT NULL DEFAULT (now()),
	`sessionId` varchar(64),
	CONSTRAINT `eventTypeClicks_id` PRIMARY KEY(`id`)
);
