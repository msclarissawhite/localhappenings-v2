ALTER TABLE `eventFeedback` ADD `isSpam` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `eventFeedback` ADD `spamReason` text;