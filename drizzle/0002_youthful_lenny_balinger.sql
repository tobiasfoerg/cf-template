ALTER TABLE `session` DROP COLUMN `impersonated_by`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `role`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `banned`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `ban_reason`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `ban_expires`;