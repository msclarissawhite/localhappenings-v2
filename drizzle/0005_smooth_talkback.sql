CREATE TABLE `savedLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`province` varchar(100) NOT NULL,
	`municipality` varchar(150) NOT NULL,
	`neighborhoodCommunity` varchar(150),
	`venue` text,
	`address` text,
	`accessibility` text NOT NULL,
	`isIndoor` int NOT NULL DEFAULT 0,
	`isOutdoor` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedLocations_id` PRIMARY KEY(`id`)
);
