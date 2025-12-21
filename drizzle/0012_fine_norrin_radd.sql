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
