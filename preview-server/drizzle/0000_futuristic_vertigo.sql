CREATE TABLE `class_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`title` text NOT NULL,
	`payload` text NOT NULL,
	`due_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `study_classes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `assignment_class` ON `class_assignments` (`class_id`);--> statement-breakpoint
CREATE TABLE `study_classes` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`join_code` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `study_classes_join_code_unique` ON `study_classes` (`join_code`);--> statement-breakpoint
CREATE INDEX `class_owner` ON `study_classes` (`owner_id`);--> statement-breakpoint
CREATE TABLE `class_members` (
	`class_id` text NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`joined_at` integer NOT NULL,
	PRIMARY KEY(`class_id`, `user_id`),
	FOREIGN KEY (`class_id`) REFERENCES `study_classes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `member_user` ON `class_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `assignment_submissions` (
	`assignment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`answers` text NOT NULL,
	`score` integer NOT NULL,
	`total` integer NOT NULL,
	`attempts` integer NOT NULL,
	`submitted_at` integer NOT NULL,
	PRIMARY KEY(`assignment_id`, `user_id`),
	FOREIGN KEY (`assignment_id`) REFERENCES `class_assignments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sync_snapshots` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`payload` text NOT NULL,
	`updated_at` integer NOT NULL
);
