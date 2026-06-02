ALTER TABLE "character_template" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "character_template" ADD COLUMN "player_id" integer;--> statement-breakpoint
ALTER TABLE "character_template" ADD CONSTRAINT "character_template_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;
