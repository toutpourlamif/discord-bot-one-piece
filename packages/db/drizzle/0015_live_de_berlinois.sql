ALTER TABLE "character_instance" ADD COLUMN "joined_crew_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "character_instance" ADD COLUMN "is_captain" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "character_instance_one_captain_per_player" ON "character_instance" USING btree ("player_id") WHERE "character_instance"."is_captain";--> statement-breakpoint
ALTER TABLE "character_instance" ADD CONSTRAINT "character_instance_captain_must_be_in_crew" CHECK (NOT "character_instance"."is_captain" OR "character_instance"."joined_crew_at" IS NOT NULL);