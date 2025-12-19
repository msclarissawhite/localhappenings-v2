CREATE TABLE `magicLinkTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizerId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `magicLinkTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `magicLinkTokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `organizers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`organizationName` varchar(255),
	`phone` varchar(50),
	`isVerified` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastLoginAt` timestamp,
	CONSTRAINT `organizers_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `events` ADD `organizerId` int;