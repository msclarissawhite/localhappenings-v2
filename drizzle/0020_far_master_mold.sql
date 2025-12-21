CREATE TABLE `verificationRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizerId` int NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`businessType` enum('business','nonprofit','community','municipality','school-library','other') NOT NULL,
	`documentUrl` text NOT NULL,
	`additionalInfo` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedBy` int,
	CONSTRAINT `verificationRequests_id` PRIMARY KEY(`id`)
);
