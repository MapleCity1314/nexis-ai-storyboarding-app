ALTER TABLE "projects" ADD COLUMN "is_deleted" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "deleted_at" timestamp;