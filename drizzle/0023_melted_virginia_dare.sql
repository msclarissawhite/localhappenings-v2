CREATE TABLE `homepageBanners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`bgGradient` varchar(255) NOT NULL,
	`textColor` varchar(100) NOT NULL,
	`icon` varchar(50),
	`eventTypeIds` json,
	`provinces` json,
	`municipalities` json,
	`startDate` date,
	`endDate` date,
	`isActive` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`activeMonths` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepageBanners_id` PRIMARY KEY(`id`)
);
