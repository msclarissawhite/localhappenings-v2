CREATE TABLE `collectionToEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collectionId` int NOT NULL,
	`eventId` int NOT NULL,
	CONSTRAINT `collectionToEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`eventTypeIds` json,
	`provinces` json,
	`municipalities` json,
	`startDate` date,
	`endDate` date,
	`isActive` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `collections_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
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
CREATE TABLE `event_claim_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`organizerEmail` varchar(320) NOT NULL,
	`eventIds` text NOT NULL,
	`claimed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`claimedAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `event_claim_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_claim_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `eventEditHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`adminId` int NOT NULL,
	`adminName` text,
	`changedFields` json,
	`editedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventEditHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`attended` int NOT NULL,
	`accuracyRating` int,
	`helpfulDetails` json,
	`inaccurateDetails` json,
	`comments` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`syncedToClickUp` int NOT NULL DEFAULT 0,
	`clickUpSyncedAt` timestamp,
	`isSpam` int NOT NULL DEFAULT 0,
	`spamReason` text,
	CONSTRAINT `eventFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateName` varchar(255) NOT NULL,
	`description` text,
	`templateData` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eventTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventToEventTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`eventTypeId` int NOT NULL,
	CONSTRAINT `eventToEventTypes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventTypeClicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventTypeId` int NOT NULL,
	`clickedAt` timestamp NOT NULL DEFAULT (now()),
	`sessionId` varchar(64),
	CONSTRAINT `eventTypeClicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` enum('family-kids','arts-culture','community-social','recreation-sports','markets-festivals','seasonal') NOT NULL DEFAULT 'community-social',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventTypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `eventTypes_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`province` varchar(100) NOT NULL,
	`municipality` varchar(150) NOT NULL,
	`neighborhoodCommunity` varchar(150),
	`venue` text,
	`address` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`timeOfDay` enum('morning','afternoon','evening','all-day'),
	`isRecurring` int NOT NULL DEFAULT 0,
	`recurrenceType` enum('one-time','weekly','monthly','seasonal') DEFAULT 'one-time',
	`isFree` int NOT NULL DEFAULT 0,
	`costMin` int,
	`costMax` int,
	`costType` enum('fixed','range','donation','pay-what-you-can','sliding-scale'),
	`kidsFree` int NOT NULL DEFAULT 0,
	`freeCompanion` int NOT NULL DEFAULT 0,
	`allAges` int NOT NULL DEFAULT 0,
	`familyFriendly` int NOT NULL DEFAULT 0,
	`youngChildren` int NOT NULL DEFAULT 0,
	`kids` int NOT NULL DEFAULT 0,
	`teens` int NOT NULL DEFAULT 0,
	`adultsOnly` int NOT NULL DEFAULT 0,
	`seniors` int NOT NULL DEFAULT 0,
	`isIndoor` int NOT NULL DEFAULT 0,
	`isOutdoor` int NOT NULL DEFAULT 0,
	`shortDuration` int NOT NULL DEFAULT 0,
	`dropIn` int NOT NULL DEFAULT 0,
	`canReenter` int NOT NULL DEFAULT 0,
	`accessibility` text NOT NULL,
	`organizerId` int,
	`organizerName` varchar(255),
	`organizerType` enum('business','nonprofit','community','municipality','school-library','other'),
	`organizerEmail` varchar(320),
	`organizerPhone` varchar(50),
	`organizerWebsite` text,
	`displayOrganizerInfo` int NOT NULL DEFAULT 1,
	`publicContactName` varchar(255),
	`publicContactEmail` varchar(320),
	`publicContactPhone` varchar(50),
	`notes` text,
	`imageUrl` text,
	`status` enum('pending','published','rejected','needs-clarification','closed') NOT NULL DEFAULT 'pending',
	`submittedBy` int,
	`reviewedBy` int,
	`reviewNotes` text,
	`hasUnreviewedEdit` int NOT NULL DEFAULT 0,
	`pendingEditData` text,
	`clickupTaskId` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`publishedAt` timestamp,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `feedbackTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`category` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedbackTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `organizerImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` text NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`description` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organizerImages_id` PRIMARY KEY(`id`)
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
--> statement-breakpoint
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
	`isDefault` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedLocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `pendingEmail` varchar(320);