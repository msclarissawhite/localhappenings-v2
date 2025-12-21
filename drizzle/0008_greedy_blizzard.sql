CREATE TABLE `featureRequestUpvotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`featureRequestId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `featureRequestUpvotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `featureRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`userId` int,
	`submitterName` varchar(100),
	`submitterEmail` varchar(255),
	`status` enum('pending','under_review','planned','in_progress','completed','declined') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`clickupTaskId` varchar(100),
	`clickupTaskUrl` text,
	`upvoteCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featureRequests_id` PRIMARY KEY(`id`)
);
