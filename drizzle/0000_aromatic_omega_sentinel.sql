CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`shop` text NOT NULL,
	`device` text NOT NULL,
	`crowd` integer NOT NULL,
	`wait` integer,
	`people` integer,
	`service` text NOT NULL,
	`created` integer NOT NULL,
	`slot` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `shop_time` ON `reports` (`shop`,`created`);--> statement-breakpoint
CREATE UNIQUE INDEX `device_shop_slot` ON `reports` (`device`,`shop`,`slot`);--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`area` text NOT NULL,
	`details` text NOT NULL,
	`lat` text NOT NULL,
	`lng` text NOT NULL,
	`device` text NOT NULL,
	`created` integer NOT NULL,
	`slot` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `device_suggestion_slot` ON `suggestions` (`device`,`slot`);