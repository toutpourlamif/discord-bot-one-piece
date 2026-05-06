ALTER TABLE "player" ADD COLUMN "travel_target_zone" "zone";--> statement-breakpoint
ALTER TABLE "player" ADD COLUMN "travel_started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "player" ADD COLUMN "travel_eta_at" timestamp with time zone;