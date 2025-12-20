CREATE TABLE `donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`donorName` varchar(255),
	`donorEmail` varchar(320) NOT NULL,
	`message` text,
	`amount` int NOT NULL,
	`isRecurring` int NOT NULL DEFAULT 0,
	`stripePaymentIntentId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`isAnonymous` int NOT NULL DEFAULT 0,
	`showAmount` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `donations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `featuredEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`organizerId` int NOT NULL,
	`weeksPurchased` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`amountPaid` int NOT NULL,
	`stripePaymentIntentId` varchar(255) NOT NULL,
	`status` enum('active','expired') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `featuredEvents_id` PRIMARY KEY(`id`)
);
