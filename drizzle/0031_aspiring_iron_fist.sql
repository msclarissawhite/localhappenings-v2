CREATE TABLE `contactInfoTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`contactEmail` varchar(320),
	`contactPhone` varchar(50),
	`contactWebsite` text,
	`displayPublicly` int NOT NULL DEFAULT 1,
	`isDefault` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contactInfoTemplates_id` PRIMARY KEY(`id`)
);
