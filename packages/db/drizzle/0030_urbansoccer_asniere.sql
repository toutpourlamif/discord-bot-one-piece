ALTER TABLE "player" ADD COLUMN "travel_target_zone" "zone";--> statement-breakpoint
ALTER TABLE "player" ADD COLUMN "travel_started_bucket" integer;--> statement-breakpoint
ALTER TABLE "player" ADD COLUMN "travel_eta_bucket" integer;
