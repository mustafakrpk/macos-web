CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(64) NOT NULL,
	`app_id` varchar(64),
	`project_id` int,
	`post_slug` varchar(128),
	`ip_hash` varchar(64),
	`user_agent` varchar(255),
	`referrer` varchar(512),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
