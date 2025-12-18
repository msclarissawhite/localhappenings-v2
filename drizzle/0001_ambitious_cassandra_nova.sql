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
	`isActive` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `collections_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `eventToEventTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`eventTypeId` int NOT NULL,
	CONSTRAINT `eventToEventTypes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` enum('core','family','cultural','seasonal') NOT NULL DEFAULT 'core',
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
	`city` varchar(100) NOT NULL,
	`neighborhood` varchar(100),
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
	`organizerName` varchar(255),
	`organizerType` enum('business','nonprofit','community','municipality','school-library','other'),
	`organizerEmail` varchar(320),
	`organizerPhone` varchar(50),
	`organizerWebsite` text,
	`notes` text,
	`imageUrl` text,
	`status` enum('pending','published','rejected','needs-clarification') NOT NULL DEFAULT 'pending',
	`submittedBy` int,
	`reviewedBy` int,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`publishedAt` timestamp,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
